import { NextRequest, NextResponse } from 'next/server';
import { requireUserId } from '@/lib/auth';
import { promises as dns } from 'node:dns';
import net from 'node:net';

interface BookmarkMetadata {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  type: 'youtube' | 'twitter' | 'website';
}

// Private/reserved IPv4 ranges. Any address that matches — including those
// reached via attacker-controlled DNS — must not be fetched.
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true; // malformed — treat as unsafe
  }
  const [a, b] = parts;
  return (
    a === 0 ||                                 // 0.0.0.0/8
    a === 10 ||                                // 10.0.0.0/8
    a === 127 ||                               // 127.0.0.0/8 (loopback)
    (a === 169 && b === 254) ||                // 169.254.0.0/16 (link-local, incl. cloud metadata)
    (a === 172 && b >= 16 && b <= 31) ||       // 172.16.0.0/12
    (a === 192 && b === 168) ||                // 192.168.0.0/16
    (a === 100 && b >= 64 && b <= 127) ||      // 100.64.0.0/10 (CGNAT)
    a === 224 ||                               // 224.0.0.0/4 (multicast)
    a >= 240                                   // 240.0.0.0/4 (reserved)
  );
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  // IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1) — unwrap and re-check
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  if (lower === '::' || lower === '::1') return true;          // unspecified / loopback
  if (lower.startsWith('fe80:') || lower.startsWith('fe80::')) return true; // link-local
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;        // unique local fc00::/7
  if (lower.startsWith('ff')) return true;                                  // multicast ff00::/8
  return false;
}

function isPrivateIp(ip: string, family?: number): boolean {
  if (family === 6 || net.isIPv6(ip)) return isPrivateIPv6(ip);
  if (family === 4 || net.isIPv4(ip)) return isPrivateIPv4(ip);
  return true; // unknown family — fail closed
}

async function resolvesToPublicIp(hostname: string): Promise<boolean> {
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    if (addrs.length === 0) return false;
    return addrs.every((a) => !isPrivateIp(a.address, a.family));
  } catch {
    return false;
  }
}

function isUnsafeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Block non-http(s) protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) return true;

    // Literal-IP fast path — if the hostname IS an IP, check it directly.
    // Strip IPv6 brackets if present.
    const stripped = hostname.startsWith('[') && hostname.endsWith(']')
      ? hostname.slice(1, -1)
      : hostname;
    if (net.isIP(stripped)) {
      return isPrivateIp(stripped);
    }

    // Blocklist a few name-based cases that DNS-resolution won't always catch
    // (e.g. operators mapping internal names to private IPs). Real SSRF
    // prevention happens via resolvesToPublicIp() below, called by the caller.
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname === 'metadata.google.internal'
    ) return true;

    return false;
  } catch {
    return true;
  }
}

function getBookmarkType(url: string): 'youtube' | 'twitter' | 'website' | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // YouTube detection
    if (
      hostname.includes('youtube.com') ||
      hostname.includes('youtu.be')
    ) {
      return 'youtube';
    }

    // Twitter/X detection
    if (
      hostname.includes('twitter.com') ||
      hostname.includes('x.com')
    ) {
      return 'twitter';
    }

    // Any other valid URL is a website
    return 'website';
  } catch {
    return null;
  }
}

async function fetchYouTubeMetadata(url: string): Promise<BookmarkMetadata | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const response = await fetch(oembedUrl);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return {
      title: data.title || 'Untitled Video',
      description: data.author_name ? `By ${data.author_name}` : undefined,
      thumbnailUrl: data.thumbnail_url || undefined,
      type: 'youtube',
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
}

async function fetchTwitterMetadata(url: string): Promise<BookmarkMetadata | null> {
  try {
    // First try oEmbed for basic info
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
    const oembedResponse = await fetch(oembedUrl);

    let authorName = 'Unknown';
    let tweetText = '';

    if (oembedResponse.ok) {
      const data = await oembedResponse.json();
      authorName = data.author_name || 'Unknown';

      // Extract tweet text from HTML (remove HTML tags)
      if (data.html) {
        const textMatch = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
        if (textMatch) {
          tweetText = textMatch[1]
            .replace(/<[^>]*>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
        }
      }
    }

    // Try to fetch the page to get og:image for thumbnail
    let thumbnailUrl: string | undefined = undefined;
    try {
      const pageResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        },
      });

      if (pageResponse.ok) {
        const html = await pageResponse.text();

        // Extract og:image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

        if (ogImageMatch && ogImageMatch[1]) {
          thumbnailUrl = ogImageMatch[1];
        }
      }
    } catch (e) {
      console.error('Could not fetch Twitter page for thumbnail:', e);
    }

    return {
      title: tweetText ? `${authorName}: "${tweetText.substring(0, 100)}${tweetText.length > 100 ? '...' : ''}"` : `Post by ${authorName}`,
      description: `By ${authorName}`,
      thumbnailUrl,
      type: 'twitter',
    };
  } catch (error) {
    console.error('Error fetching Twitter metadata:', error);
    return null;
  }
}

function parseHtmlMetadata(url: string, html: string): BookmarkMetadata {
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = ogTitleMatch?.[1] || titleTagMatch?.[1] || new URL(url).hostname;

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  const description = ogDescMatch?.[1] || metaDescMatch?.[1];

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  let thumbnailUrl = ogImageMatch?.[1];

  if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
    const urlObj = new URL(url);
    thumbnailUrl = thumbnailUrl.startsWith('/')
      ? `${urlObj.protocol}//${urlObj.host}${thumbnailUrl}`
      : `${urlObj.protocol}//${urlObj.host}/${thumbnailUrl}`;
  }

  return { title: title.trim(), description: description?.trim(), thumbnailUrl, type: 'website' };
}

async function fetchWebsiteMetadata(url: string): Promise<BookmarkMetadata | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      redirect: 'manual',
    });

    // Block redirects to prevent SSRF via redirect to internal IPs.
    // Re-validate both the literal-IP/protocol gate AND the DNS resolution
    // so an attacker can't redirect from a public host to a private one.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) return null
      if (isUnsafeUrl(location)) return null
      try {
        const redirectHost = new URL(location).hostname
        if (!net.isIP(redirectHost) && !(await resolvesToPublicIp(redirectHost))) return null
      } catch {
        return null
      }
      const redirectResponse = await fetch(location, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
        redirect: 'manual',
      })
      if (!redirectResponse.ok) return null
      const html = await redirectResponse.text()
      return parseHtmlMetadata(url, html)
    }

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    return parseHtmlMetadata(url, html);
  } catch (error) {
    console.error('Error fetching website metadata:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireUserId();
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (isUnsafeUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    // SSRF defence: resolve the hostname and reject if any resolved IP is
    // private/reserved. The literal-IP case is handled inside isUnsafeUrl.
    try {
      const hostname = new URL(url).hostname;
      if (!net.isIP(hostname) && !(await resolvesToPublicIp(hostname))) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const bookmarkType = getBookmarkType(url);

    if (!bookmarkType) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let metadata: BookmarkMetadata | null = null;

    if (bookmarkType === 'youtube') {
      metadata = await fetchYouTubeMetadata(url);
    } else if (bookmarkType === 'twitter') {
      metadata = await fetchTwitterMetadata(url);
    } else if (bookmarkType === 'website') {
      metadata = await fetchWebsiteMetadata(url);
    }

    if (!metadata) {
      return NextResponse.json(
        {
          error: 'Failed to fetch metadata. You can still create the bookmark manually.',
          fallback: {
            title: url,
            type: bookmarkType,
          }
        },
        { status: 200 }
      );
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error in bookmark-metadata API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
