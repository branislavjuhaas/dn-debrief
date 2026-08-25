import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const sendEmail = async (
  to: string | string[],
  subject: string,
  text: string,
  html?: string,
) => {
  if (import.meta.dev || import.meta.test) {
    console.log(
      `[MAIL] Sending email to: ${to}, subject: ${subject}, text: ${text}, html: ${html}`,
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
          Data: html || text,
        },
        Text: {
          Charset: "UTF-8",
          Data: text,
        },
      },
    },
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
) => `<!DOCTYPE html>
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--[if mso]>
      <style>
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
      </style>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="screen">
    <style>
      @media (max-width: 600px) {
        .sm-p-6 {
          padding: 24px !important;
        }
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400&display=swap" rel="stylesheet" media="screen">
  </head>
  <body xml:lang="en" style="margin: 0; width: 100%; height: 100%; padding: 0; word-break: break-word;">
    <div style="display:none;">
      ${preheader}&#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &nbsp;
    </div>
    <span style="display:none;">
      <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          <w:WordDocument>
            <w:DontUseAdvancedTypographyReadingMail />
          </w:WordDocument>
        </xml>
      <![endif]-->
    </span>
    <div role="article" aria-roledescription="email" lang="en" dir="ltr" style="font-size: medium; background-color: #e4e4e7; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; font-size: max(16px, 1rem);">
      <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 576px" align="center"><tr><td style="padding: 40px 0"><![endif]-->
      <div class="sm-p-6" style="margin: 0 auto; max-width: 576px; padding: 40px 0;">
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1px solid #d4d4d8; background-color: #fafafa; padding: 20px 24px;">
          <a href="https://debrief.sda.sk" style="text-decoration: none;"><img src="https://v2.debrief.sda.sk/mailing/logo.png" alt="Maizzle" style="height: 20px; width: 72px; max-width: 100%; vertical-align: middle;" width="526" height="20"></a>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-left: 1px solid #d4d4d8; border-bottom-color: #d4d4d8; border-right: 1px solid #d4d4d8; border-top-color: #d4d4d8; background-color: #fafafa; padding: 24px;">
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="font-size: 0;">
            <!--[if mso]><td style="width: 526px"><![endif]-->
            <div style="width: 526px; max-width: 100%; display: inline-block; text-align: center; font-size: medium"><div role="separator" style="line-height: 32px;">&zwj;</div></div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="margin-top: 24px; margin-bottom: 8px; text-align: center; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; color: #27272a;">
            <!--[if mso]><td style="width: 526px"><![endif]-->
            <div style="width: 526px; max-width: 100%; display: inline-block; font-size: medium">
              <h1 style="margin: 0; font-size: 20px; line-height: 28px;">${title}</h1>
              <p style="margin-left: 40px; margin-right: 40px; margin-top: 4px; font-size: 16px; line-height: 24px; color: #71717a;">${text}</p>
            </div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="font-size: 0;">
            <!--[if mso]><td style="width: 526px"><![endif]-->
            <div style="width: 526px; max-width: 100%; display: inline-block; font-size: medium">
              <div>
                <a
                  style="display: inline-block; width: calc(100% - 24px); border-radius: 8px; background-color: #19af5a; padding: 12px; text-align: center; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; font-size: 16px; line-height: 1; color: #fffffe; text-decoration: none;"
                  href="${buttonUrl}"
                >
                  <!--[if mso]><i style="mso-font-width: 150%; mso-text-raise: 31px;" hidden>&emsp;</i><![endif]-->
                  <span style="mso-text-raise: 16px;">${buttonText}</span>
                  <!--[if mso]><i style="mso-font-width: 150%;" hidden>&emsp;&#8203;</i><![endif]-->
                </a>
              </div>
            </div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-bottom-right-radius: 8px; border-bottom-left-radius: 8px; border: 1px solid #d4d4d8; background-color: #fafafa; padding: 20px 24px;">
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="font-size: 0;">
            <!--[if mso]><td style="width: 506px"><![endif]-->
            <div style="width: 506px; max-width: 100%; display: inline-block; font-size: medium">
              <span style="font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; font-size: 14px; line-height: 20px; color: #71717a;">2024 - 2026 | Branislav Juhás & VpVSÚPDND</span>
            </div>
            <!--[if mso]></td><![endif]-->
            <!--[if mso]><td style="width: 20px"><![endif]-->
            <div style="width: 20px; max-width: 100%; display: inline-block; font-size: medium">
              <a href="https://github.com/branislavjuhaas/dn-debrief" target="_blank" style="text-decoration: none;"><img src="https://v2.debrief.sda.sk/mailing/github-logo.png" alt="Icon" width="20" style="height: 20px; max-width: 100%; vertical-align: middle;" height="20"></a>
            </div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
  </body>
</html>`;

export const generateMessageMail = (
  preheader: string,
  title: string,
  text: string,
) => `<!DOCTYPE html>
<html lang="en" dir="ltr" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <!--[if mso]>
      <style>
        td,th,div,p,a,h1,h2,h3,h4,h5,h6 {font-family: "Segoe UI", sans-serif; mso-line-height-rule: exactly;}
      </style>
    <![endif]-->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="screen">
    <style>
      @media (max-width: 600px) {
        .sm-p-6 {
          padding: 24px !important;
        }
      }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400&display=swap" rel="stylesheet" media="screen">
  </head>
  <body xml:lang="en" style="margin: 0; width: 100%; height: 100%; padding: 0; word-break: break-word;">
    <div style="display:none;">
      ${preheader}&#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847;
      &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &#8199;&#65279;&#847; &nbsp;
    </div>
    <span style="display:none;">
      <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
          <w:WordDocument>
            <w:DontUseAdvancedTypographyReadingMail />
          </w:WordDocument>
        </xml>
      <![endif]-->
    </span>
    <div role="article" aria-roledescription="email" lang="en" dir="ltr" style="font-size: medium; background-color: #e4e4e7; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; font-size: max(16px, 1rem);">
      <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 576px" align="center"><tr><td style="padding: 40px 0"><![endif]-->
      <div class="sm-p-6" style="margin: 0 auto; max-width: 576px; padding: 40px 0;">
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-top-left-radius: 8px; border-top-right-radius: 8px; border: 1px solid #d4d4d8; background-color: #fafafa; padding: 20px 24px;">
          <a href="https://debrief.sda.sk" style="text-decoration: none;"><img src="https://v2.debrief.sda.sk/mailing/logo.png" alt="Maizzle" style="height: 20px; width: 72px; max-width: 100%; vertical-align: middle;" width="526" height="20"></a>
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-left: 1px solid #d4d4d8; border-bottom-color: #d4d4d8; border-right: 1px solid #d4d4d8; border-top-color: #d4d4d8; background-color: #fafafa; padding: 24px;">
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="font-size: 0;">
            <!--[if mso]><td style="width: 526px"><![endif]-->
            <div style="width: 526px; max-width: 100%; display: inline-block; text-align: center; font-size: medium"><div role="separator" style="line-height: 32px;">&zwj;</div></div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="margin-top: 24px; text-align: center; font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; color: #27272a;">
            <!--[if mso]><td style="width: 526px"><![endif]-->
            <div style="width: 526px; max-width: 100%; display: inline-block; font-size: medium">
              <h1 style="margin: 0; font-size: 20px; line-height: 28px;">${title}</h1>
              <p style="margin-left: 40px; margin-right: 40px; margin-top: 4px; font-size: 16px; line-height: 24px; color: #71717a;">${text}</p>
            </div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
        <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><td style="background-color: #fafafa"><![endif]-->
        <div style="border-bottom-right-radius: 8px; border-bottom-left-radius: 8px; border: 1px solid #d4d4d8; background-color: #fafafa; padding: 20px 24px;">
          <!--[if mso]><table role="none" cellpadding="0" cellspacing="0" style="width: 100%"><tr><![endif]-->
          <div style="font-size: 0;">
            <!--[if mso]><td style="width: 506px"><![endif]-->
            <div style="width: 506px; max-width: 100%; display: inline-block; font-size: medium">
              <span style="font-family: 'DM Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans', Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; font-size: 14px; line-height: 20px; color: #71717a;">2024 - 2026 | Branislav Juhás & VpVSÚPDND</span>
            </div>
            <!--[if mso]></td><![endif]-->
            <!--[if mso]><td style="width: 20px"><![endif]-->
            <div style="width: 20px; max-width: 100%; display: inline-block; font-size: medium">
              <a href="https://github.com/branislavjuhaas/dn-debrief" target="_blank" style="text-decoration: none;"><img src="https://v2.debrief.sda.sk/mailing/github-logo.png" alt="Icon" width="20" style="height: 20px; max-width: 100%; vertical-align: middle;" height="20"></a>
            </div>
            <!--[if mso]></td><![endif]-->
          </div>
          <!--[if mso]></tr></table><![endif]-->
        </div>
        <!--[if mso]></td></tr></table><![endif]-->
      </div>
      <!--[if mso]></td></tr></table><![endif]-->
    </div>
  </body>
</html>`;
