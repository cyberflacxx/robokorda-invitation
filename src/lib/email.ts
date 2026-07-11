import nodemailer from "nodemailer";

export interface InvitationEmailParams {
  to: string;
  guestName: string;
  eventName: string;
  rsvpCode: string;
  inviteLink: string;
  eventDate?: string;
  venueName?: string;
  venueAddress?: string;
}

function getSenderAppName() {
  return process.env.INVITATION_APP_NAME?.trim() || "Robokorda Africa - Invitation";
}

function buildTransporter() {
  const appPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: appPassword,
    },
  });
}

function htmlTemplate(params: InvitationEmailParams): string {
  const { guestName, eventName, rsvpCode, inviteLink, eventDate, venueName, venueAddress } = params;
  const firstName = guestName.split(" ")[0];
  const dateDisplay = eventDate
    ? new Date(eventDate).toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";
  const venueDisplay = venueName && venueAddress
    ? `${venueName}, ${venueAddress}`
    : venueName || venueAddress || "Manna Safari Lodge, Harare Zimbabwe";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You're Invited</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B1F3A 0%,#102A43 60%,#1a3a5c 100%);padding:48px 40px;text-align:center;">
              <p style="margin:0 0 8px;color:#D4AF37;font-size:11px;letter-spacing:4px;text-transform:uppercase;">Private Invitation</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:600;line-height:1.3;">${eventName}</h1>
              ${dateDisplay ? `<p style="margin:12px 0 0;color:#bcccdc;font-size:14px;">${dateDisplay}</p>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              <p style="margin:0 0 8px;color:#0B1F3A;font-size:22px;font-weight:600;">Hi ${firstName}!</p>
              <p style="margin:0 0 20px;color:#4a5568;font-size:16px;line-height:1.7;">
                I hope that you're well. Please find details about <strong>${eventName}</strong> here. You are cordially invited to join us for this special occasion.
              </p>

              <!-- RSVP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td style="background:#f8f4e8;border:2px solid #D4AF37;border-radius:10px;padding:20px;text-align:center;">
                    <p style="margin:0 0 6px;color:#6b5a2a;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Your RSVP Code</p>
                    <p style="margin:0;color:#0B1F3A;font-size:26px;font-weight:700;letter-spacing:4px;">${rsvpCode}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.7;">
                Use this code when you open your invitation to confirm your attendance.
              </p>

              <p style="margin:0 0 24px;color:#4a5568;font-size:15px;line-height:1.7;">
                Venue: <strong>${venueDisplay}</strong>
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}"
                       style="display:inline-block;background:#102A43;color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
                      Open My Invitation →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#4a5568;font-size:15px;line-height:1.7;">
                Looking forward to seeing you!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0B1F3A;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#D4AF37;font-size:14px;font-weight:600;">${eventName}</p>
              <p style="margin:0;color:#bcccdc;font-size:13px;">Venue: ${venueDisplay}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInvitationEmail(params: InvitationEmailParams): Promise<void> {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error("Email credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env");
  }

  const firstName = params.guestName.split(" ")[0];
  const senderAppName = getSenderAppName();
  const venueDisplay = params.venueName && params.venueAddress
    ? `${params.venueName}, ${params.venueAddress}`
    : params.venueName || params.venueAddress || "Manna Safari Lodge, Harare Zimbabwe";
  const text = `Hi ${firstName}!\nI hope that you're well. Please find details about ${params.eventName} here. Venue: ${venueDisplay}. RSVP code is ${params.rsvpCode}. Looking forward to seeing you.\n${params.inviteLink}`;

  const transporter = buildTransporter();

  await transporter.sendMail({
    from: `"${senderAppName}" <${process.env.GMAIL_USER}>`,
    to: params.to,
    subject: `You're invited: ${params.eventName}`,
    text,
    html: htmlTemplate(params),
  });
}
