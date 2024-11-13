import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { hash } from "bcrypt";

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await this.userRepository.find({
        select: ["id", "username", "email", "role", "created_at", "last_login"],
      });
      return res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const { username, email, password, role } = req.body;
      const hashedPassword = await hash(password, 10);
      const user = this.userRepository.create({
        username,
        email,
        password: hashedPassword,
        role,
      });
      await this.userRepository.save(user);
      return res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { username, email, role, password } = req.body;

      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update basic fields
      user.username = username;
      user.email = email;
      user.role = role;

      // Hash password if provided
      if (password && password.trim()) {
        console.log("Hashing new password for user:", user.username);
        const hashedPassword = await hash(password, 10);
        user.password = hashedPassword;
      }

      const savedUser = await this.userRepository.save(user);
      console.log("User updated successfully:", savedUser.username);

      return res.json({
        message: "User updated successfully",
        user: {
          id: savedUser.id,
          username: savedUser.username,
          email: savedUser.email,
          role: savedUser.role,
        },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await this.userRepository.findOne({
        where: { id: parseInt(id) },
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
