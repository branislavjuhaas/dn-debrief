import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/**
 * Renders a minimal, transactional e-mail.
 *
 * Deliberately avoids images, web fonts, tracking pixels and marketing copy:
 * those are the main reasons Gmail classifies transactional mail as
 * promotional. Every e-mail also has a plain-text alternative (see
 * `sendEmail`).
 */
const renderTransactionalEmail = (options: {
  preheader: string;
  title: string;
  text: string;
  buttonUrl?: string;
  buttonText?: string;
}) => {
  const { preheader, title, text, buttonUrl, buttonText } = options;

  const button =
    buttonUrl && buttonText
      ? `
              <p style="margin: 0 0 24px;">
                <a href="${escapeHtml(buttonUrl)}" style="display: inline-block; border-radius: 6px; background-color: #15803d; color: #ffffff; font-family: inherit; font-size: 16px; font-weight: 600; line-height: 1.2; padding: 12px 20px; text-decoration: none;">${escapeHtml(buttonText)}</a>
              </p>
              <p style="margin: 0; color: #71717a; font-size: 13px; line-height: 1.5;">
                Ak tlačidlo nefunguje, otvorte tento odkaz:<br>
                <a href="${escapeHtml(buttonUrl)}" style="color: #15803d; word-break: break-all;">${escapeHtml(buttonUrl)}</a>
              </p>`
      : "";

  return `<!DOCTYPE html>
<html lang="sk">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border: 1px solid #d4d4d8; border-radius: 8px;">
            <tr>
              <td style="padding: 24px; color: #27272a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                <h1 style="margin: 0 0 12px; font-size: 20px; line-height: 1.3;">${escapeHtml(title)}</h1>
                <p style="margin: 0 0 24px; color: #52525b;">${escapeHtml(text)}</p>${button}
              </td>
            </tr>
          </table>
          <p style="margin: 16px auto 0; max-width: 560px; color: #71717a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.5; text-align: center;">
            DebRIEF · Slovenská debatná asociácia
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

export const sendEmail = async (
  to: string | string[],
  subject: string,
  text: string,
  html?: string,
) => {
  if (import.meta.dev || import.meta.test) {
    const recipients = Array.isArray(to) ? to.join(", ") : to;
    console.log(
      `[MAIL] Sending email to: ${recipients}, subject: ${subject}, text: ${text}, html: ${html}`,
    );
    return;
  }

  const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const params = {
    Source: `${process.env.AWS_FROM_NAME} <${process.env.AWS_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: Array.isArray(to) ? to : [to],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            html ||
            renderTransactionalEmail({
              preheader: subject,
              title: subject,
              text,
            }),
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
    },
    ...(process.env.AWS_REPLY_TO_EMAIL
      ? { ReplyToAddresses: [process.env.AWS_REPLY_TO_EMAIL] }
      : {}),
    ...(process.env.AWS_SES_CONFIGURATION_SET
      ? { ConfigurationSetName: process.env.AWS_SES_CONFIGURATION_SET }
      : {}),
  };
  const command = new SendEmailCommand(params);
  await sesClient.send(command);
};

export const generateActionMail = (
  preheader: string,
  title: string,
  text: string,
  buttonUrl: string,
  buttonText: string,
) =>
  renderTransactionalEmail({
    preheader,
    title,
    text,
    buttonUrl,
    buttonText,
  });

export const generateMessageMail = (
  preheader: string,
  title: string,
  text: string,
) =>
  renderTransactionalEmail({
    preheader,
    title,
    text,
  });
