import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { compare, hash } from "bcrypt";
import { generateToken } from "../middlewares/authMiddleware";
import { EmailService } from "../services/EmailService";
import { MoreThan } from "typeorm";

interface AuthRequest
  extends Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>> {
  userId?: number;
}

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private emailService = new EmailService();

  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await hash(password, 10);
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      const token = await generateToken(user.id);
      return res
        .status(201)
        .json({ message: "User registered successfully", token });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Ensure we get all needed fields including password
      const user = await this.userRepository.findOne({
        where: { email },
        select: ["id", "email", "password", "username", "role", "vendeur", "client"],
        relations: ["vendeur", "client"]
      });

      if (!user) {
        console.log("User not found:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Log password comparison for debugging
      console.log("Attempting password verification for user:", user.email);
      const isPasswordValid = await compare(password, user.password);
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = await generateToken(user.id);

      // Update last login
      user.last_login = new Date();
      await this.userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Login error details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["vendeur", "client"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        vendeur: user.vendeur,
        client: user.client,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async logout(req: AuthRequest, res: Response) {
    return res.json({ message: "Logged out successfully" });
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      const resetCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const resetCodeExpires = new Date(Date.now() + 3600000); // 1 heure

      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = resetCodeExpires;
      await this.userRepository.save(user);

      // Ici, vous devriez envoyer un email avec le code de réinitialisation
      // Pour cet exemple, nous renvoyons simplement le code
      return res.json({
        message: "Code de réinitialisation généré",
        resetCode,
      });
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation :", error);
      return res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email, resetCode } = req.body;
      const user = await this.userRepository.findOne({
        where: {
          email,
          resetPasswordCode: resetCode,
          resetPasswordExpires: MoreThan(new Date()),
        },
      });

      if (!user) {
        return res.status(400).json({ message: "Code invalide ou expiré" });
      }

      const newPassword =
        Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10);

      user.password = await hash(newPassword, 10);
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;

      await this.userRepository.save(user);
      await this.emailService.sendPasswordResetEmail(email, newPassword);

      return res.json({
        message: "Un nouveau mot de passe a été envoyé à votre adresse email",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la réinitialisation du mot de passe :",
        error
      );
      return res.status(500).json({
        message:
          "Une erreur est survenue lors de l'envoi du nouveau mot de passe",
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find();
      return res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: parseInt(req.params.id) },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, role } = req.body;
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }
      const hashedPassword = await hash(password, 10);
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await this.userRepository.save(user);
      return res
        .status(201)
        .json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: parseInt(req.params.id) },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      Object.assign(user, req.body);
      await this.userRepository.save(user);
      return res.json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: parseInt(req.params.id) },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await this.userRepository.remove(user);
      return res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
