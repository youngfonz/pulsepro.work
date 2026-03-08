import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pulsepro.work'

export async function sendWelcomeEmail(firstName: string | null, email: string) {
  if (!resend) {
    console.warn('sendWelcomeEmail: Resend not configured, skipping')
    return
  }

  const name = firstName || 'there'
  const from = process.env.RESEND_FROM_EMAIL || 'Fonz from Pulse Pro <onboarding@resend.dev>'

  await resend.emails.send({
    from,
    to: email,
    subject: 'Welcome to Pulse Pro — glad you\'re here',
    html: buildWelcomeHtml(name),
  })
}

export async function sendInvoiceEmail(invoice: {
  number: string
  shareToken: string
  dueDate: Date
  fromName: string | null
  fromEmail: string | null
  client: { name: string; email: string | null }
  subtotal: number
  total: number
}) {
  if (!resend) {
    console.warn('sendInvoiceEmail: Resend not configured, skipping')
    return
  }
  if (!invoice.client.email) {
    console.warn('sendInvoiceEmail: Client has no email, skipping')
    return
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Pulse Pro <noreply@in.pulsepro.work>'
  const viewUrl = `${APP_URL}/invoice/${invoice.shareToken}`
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const dueFormatted = new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const businessName = invoice.fromName || 'Pulse Pro'

  const { data, error } = await resend.emails.send({
    from,
    to: invoice.client.email,
    subject: `Invoice ${invoice.number} from ${businessName} — ${fmt(invoice.total)} due`,
    html: buildInvoiceHtml({
      number: invoice.number,
      businessName,
      clientName: invoice.client.name,
      total: fmt(invoice.total),
      dueDate: dueFormatted,
      viewUrl,
    }),
  })

  if (error) {
    console.error('sendInvoiceEmail: Resend error:', error)
    throw new Error(`Failed to send invoice email: ${error.message}`)
  }

  // Invoice email sent successfully
}

function buildInvoiceHtml(data: {
  number: string
  businessName: string
  clientName: string
  total: string
  dueDate: string
  viewUrl: string
}): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${data.number}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f17;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">${data.businessName}</span>
            </td>
          </tr>
          <tr>
            <td style="color:#e4e4e7;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px;color:#ffffff;font-size:17px;font-weight:600;">Hi ${data.clientName},</p>
              <p style="margin:0 0 24px;">
                You have a new invoice from ${data.businessName}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:10px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#a1a1aa;font-size:13px;padding-bottom:4px;">Invoice</td>
                        <td align="right" style="color:#a1a1aa;font-size:13px;padding-bottom:4px;">Amount Due</td>
                      </tr>
                      <tr>
                        <td style="color:#ffffff;font-size:16px;font-weight:600;">${data.number}</td>
                        <td align="right" style="color:#ffffff;font-size:20px;font-weight:700;">${data.total}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:16px;border-top:1px solid #27272a;">
                          <span style="color:#a1a1aa;font-size:13px;">Due by ${data.dueDate}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="${data.viewUrl}" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                View Invoice
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:24px;">
              <div style="border-top:1px solid #27272a;padding-top:16px;">
                <p style="margin:0;color:#52525b;font-size:12px;">${data.businessName} &middot; Sent via Pulse Pro</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildWelcomeHtml(name: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Pulse Pro</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f17;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f17;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Pulse Pro</span>
            </td>
          </tr>

          <!-- Personal message -->
          <tr>
            <td style="color:#e4e4e7;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 16px;color:#ffffff;font-size:17px;font-weight:600;">Hey ${name},</p>

              <p style="margin:0 0 16px;">
                Just a quick welcome from me, Fonz &mdash; the founder of Pulse Pro. I love that you&rsquo;re here. Seriously, thank you for supporting us.
              </p>

              <p style="margin:0 0 24px;">
                I&rsquo;m building this to make your work life easier, and your feedback shapes what comes next. This is a group project &mdash; we&rsquo;re in this together.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding-bottom:24px;">
              <div style="border-top:1px solid #27272a;"></div>
            </td>
          </tr>

          <!-- Section label -->
          <tr>
            <td style="padding-bottom:16px;">
              <span style="font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:1.5px;">Here&rsquo;s what you can do</span>
            </td>
          </tr>

          <!-- Feature: Quick Capture -->
          <tr>
            <td style="padding-bottom:12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:10px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:32px;height:32px;background-color:#3b82f620;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#9889;</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 2px;color:#ffffff;font-size:14px;font-weight:600;">Quick Capture</p>
                          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">Press <strong style="color:#e4e4e7;">N</strong> anywhere in the app to add a task in seconds. No clicking around.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Feature: Email to Task -->
          <tr>
            <td style="padding-bottom:12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:10px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:32px;height:32px;background-color:#8b5cf620;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#9993;</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 2px;color:#ffffff;font-size:14px;font-weight:600;">Email to Task</p>
                          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">Forward any email to your Pulse address and it becomes a task automatically.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Feature: Telegram Bot -->
          <tr>
            <td style="padding-bottom:12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:10px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:32px;height:32px;background-color:#06b6d420;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#129302;</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 2px;color:#ffffff;font-size:14px;font-weight:600;">Telegram Bot</p>
                          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">Get daily reminders and add tasks straight from Telegram. Your tasks, wherever you are.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Feature: Siri & Shortcuts -->
          <tr>
            <td style="padding-bottom:28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#18181b;border-radius:10px;border:1px solid #27272a;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="36" valign="top">
                          <div style="width:32px;height:32px;background-color:#f59e0b20;border-radius:8px;text-align:center;line-height:32px;font-size:16px;">&#128241;</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 2px;color:#ffffff;font-size:14px;font-weight:600;">Siri &amp; Shortcuts</p>
                          <p style="margin:0;color:#a1a1aa;font-size:13px;line-height:1.5;">&ldquo;Hey Siri, add a Pulse task.&rdquo; Works on iPhone, iPad, Mac, and Apple Watch.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <a href="${APP_URL}/dashboard" style="display:inline-block;background-color:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:8px;">
                Open Pulse Pro
              </a>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td style="color:#a1a1aa;font-size:14px;line-height:1.7;">
              <p style="margin:0 0 4px;">I&rsquo;m here if you need anything. Just reply to this email.</p>
              <p style="margin:0;color:#ffffff;font-weight:600;">&mdash; Fonz</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:40px;">
              <div style="border-top:1px solid #27272a;padding-top:16px;">
                <p style="margin:0;color:#52525b;font-size:12px;">Pulse Pro &middot; Project management that stays out of your way</p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
