import nodemailer from "nodemailer";
import { emailConfig } from "../config/emailConfig";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendPasswordResetEmail(
    email: string,
    newPassword: string
  ): Promise<void> {
    console.log("Starting email send process to:", email);

    const mailOptions = {
      from: `"Kompass Company" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Réinitialisation de votre mot de passe Kompass",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Nouveau mot de passe</h2>
          <p>Voici votre nouveau mot de passe : <strong>${newPassword}</strong></p>
          <p>Connectez-vous et changez ce mot de passe immédiatement.</p>
          <h2>Passer une agréable journée.</h2>
        </div>
      `,
    };

    try {
      await this.transporter.verify();
      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
    } catch (error) {
      console.error("Email sending error:", error);
      if (error instanceof Error) {
        throw new Error(`Email sending failed: ${error.message}`);
      } else {
        throw new Error("Email sending failed due to an unknown error");
      }
    }
  }
}
