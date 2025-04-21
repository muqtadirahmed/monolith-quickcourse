import {
    SESClient,
    SESClientConfig,
    SendEmailCommand,
} from "@aws-sdk/client-ses";
import "dotenv/config";

const config: SESClientConfig = {
    credentials: {
        accessKeyId: process.env.AWS_SES_MAIL_ID ?? "",
        secretAccessKey: process.env.AWS_SES_MAIL_SECRET ?? "",
    },
    region: process.env.AWS_REGION ?? "",
};

const client = new SESClient(config);
const senderAddress = "no-reply@quickcourse.xyz";

const email_template = (email: string, verificationLink: string) => {
    const template = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 10px 0;
          }
          .content {
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              color: #ffffff;
              background-color: #007bff;
              text-decoration: none;
              border-radius: 5px;
          }
          .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #888888;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Email Verification</h1>
          </div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for registering with us. Please click the button below to verify your email address:</p>
              <p><div href="${process.env.PUBLIC_URLverificationLink
        }" class="button">Verify Email</div></p>
              <p>If you did not request this email, please ignore it.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} quickcourse.xyz All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
  `;
    const input = {
        Source: senderAddress,
        Destination: {
            ToAddresses: [email],
        },
        Message: {
            Subject: {
                Data: "Email Verification",
                Charset: "UTF-8",
            },
            Body: {
                Html: {
                    Data: template,
                    Charset: "UTF-8",
                },
            },
        },
    };
    return input;
};

export const sendVerificationEmail = async (email: string, token: string) => {
    const verification_link = `${process.env.PUBLIC_URL}/verify/${token}`;
    const mail_obj = email_template(email, verification_link);
    try {
        const command = new SendEmailCommand(mail_obj);
        return await client.send(command);
        // return true;
    } catch (error) {
        console.log(error);
        // return false;
    }
};
