import nodemailer from "nodemailer";
import User from "@/models/userModel";
import bcryptjs from "bcryptjs";
import dbConnect from "@/dbConfig/dbConfig";

export const sendEmail = async ({ email, emailType, userId }: any) => {
  try {
    await dbConnect();
    // create a hashed token
    const hashedToken = await bcryptjs.hash(userId.toString(), 10);

    if (emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000, // 1 hour
      });
    } else if (emailType === "RESET") {
      // Future implementation for reset password
    }

    // Since we don't have user's SMTP details, we can use a test account or suggest adding one.
    // For now, setting up with Mailtrap or standard SMTP from env.
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
      port: Number(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER || "your_smtp_user",
        pass: process.env.SMTP_PASS || "your_smtp_pass"
      }
    });

    const mailOptions = {
      from: 'noreply@devkit.com',
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${process.env.NEXTAUTH_URL}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"}
      or copy and paste the link below in your browser. <br>
      ${process.env.NEXTAUTH_URL}/verifyemail?token=${hashedToken}
      </p>`
    }

    const mailresponse = await transport.sendMail(mailOptions);
    return mailresponse;

  } catch (error: any) {
    throw new Error(error.message);
  }
}
