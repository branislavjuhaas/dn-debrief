import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

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
