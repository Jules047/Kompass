"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const emailConfig_1 = require("../config/emailConfig");
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport(emailConfig_1.emailConfig);
    }
    sendPasswordResetEmail(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.transporter.verify();
                const info = yield this.transporter.sendMail(mailOptions);
                console.log("Email sent successfully:", info.messageId);
            }
            catch (error) {
                console.error("Email sending error:", error);
                if (error instanceof Error) {
                    throw new Error(`Email sending failed: ${error.message}`);
                }
                else {
                    throw new Error("Email sending failed due to an unknown error");
                }
            }
        });
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map