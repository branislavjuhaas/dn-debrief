import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Generates an HTML email template.
 *
 * @param title - The main title of the email.
 * @param text - The body text of the email.
 * @param icon - URL to the icon image (optional).
 * @param linkText - Text for the action button (optional, requires link to be set).
 * @param link - URL for the action button (optional, requires linkText to be set).
 * @returns HTML string for the email.
 */
export const generateEmailTemplate = ({
  title,
  text,
  icon,
  linkText,
  link,
}: {
  title: string;
  text: string;
  icon?: string;
  linkText?: string;
  link?: string;
}): string => {
  const iconHtml = icon
    ? `<img src="${icon}" alt="ICON" style="display:block;height:64px;border:0;margin:0 auto 16px;max-width:100%;"/>`
    : "";

  const buttonHtml =
    linkText && link
      ? `<a href="${link}" target="_blank" style="display:inline-block;margin-top:24px;padding:10px 20px;background:#00C16A;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:700;">${linkText}</a>`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #E2E8F0;border-radius:10px;border-collapse:collapse;overflow:hidden;font-family:sans-serif;">
          <tr>
            <td style="padding:24px;text-align:left;border-bottom:1px solid #E2E8F0;">
              <a href="https://debrief.sda.sk" target="_blank" style="text-decoration:none;">
                <img src="https://www.sda.sk/wp-content/uploads/2025/11/debrief_ii.png" alt="DebRIEF II" style="display:block;height:24px;border:0;"/>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;text-align:center;">
              ${iconHtml}
              <h1 style="font-size:20px;font-weight:700;line-height:28px;margin:0 0 16px 0;color:#0F172B;">${title}</h1>
              <p style="font-size:16px;line-height:24px;margin:0;color:#62748E;">${text}</p>
              ${buttonHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px;text-align:left;border-top:1px solid #E2E8F0;">
              <p style="font-size:14px;line-height:20px;color:#62748E;margin:0;">2024 - 2025 | Branislav Juhás &amp; TpVSÚPDNC SDA</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/**
 * Sends an email using AWS SES.
 *
 * @param to - Recipient email addresses.
 * @param subject - Subject of the email.
 * @param html - HTML content of the email.
 * @param text - Plain text content of the email (optional).
 * @param from - Sender email address (optional, defaults to AWS_SES_SOURCE_EMAIL env variable).
 * @returns An object indicating success or failure, along with response or error message.
 */
export const sendEmail = async ({
  to,
  subject,
  html,
  text = "",
  from = process.env.AWS_SES_SOURCE_EMAIL,
}: {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) => {
  const params = {
    Source: from,
    Destination: { ToAddresses: to },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: html },
        Text: { Data: text },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    const response = await client.send(command);
    return { success: true, response };
  } catch (error) {
    console.error("SES sendEmail error:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unknown error occurred." };
  }
};
