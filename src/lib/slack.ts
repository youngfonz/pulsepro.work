import crypto from 'crypto'

/**
 * Verify a Slack slash command request via HMAC-SHA256 signature.
 * Returns true if valid, false otherwise.
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(
  rawBody: string,
  timestamp: string,
  signature: string,
  signingSecret: string,
): boolean {
  // Reject replays older than 5 minutes
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp, 10)) > 300) return false

  const sigBase = `v0:${timestamp}:${rawBody}`
  const computed = `v0=${crypto.createHmac('sha256', signingSecret).update(sigBase).digest('hex')}`

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) return false
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
}

/**
 * Exchange a Slack OAuth code for an access token.
 */
export async function exchangeSlackCode(code: string, redirectUri: string): Promise<{
  ok: boolean
  access_token?: string
  team?: { id: string; name: string }
  authed_user?: { id: string }
  error?: string
}> {
  const params = new URLSearchParams({
    code,
    redirect_uri: redirectUri,
    client_id: process.env.SLACK_CLIENT_ID!,
    client_secret: process.env.SLACK_CLIENT_SECRET!,
  })

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })

  return res.json()
}
