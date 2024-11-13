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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const bcrypt_1 = require("bcrypt");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const EmailService_1 = require("../services/EmailService");
const typeorm_1 = require("typeorm");
class AuthController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.emailService = new EmailService_1.EmailService();
    }
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password } = req.body;
                const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
                const user = this.userRepository.create({
                    username,
                    email,
                    password: hashedPassword,
                });
                yield this.userRepository.save(user);
                const token = yield (0, authMiddleware_1.generateToken)(user.id);
                return res
                    .status(201)
                    .json({ message: "User registered successfully", token });
            }
            catch (error) {
                console.error("Registration error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return res.status(400).json({ message: "Email and password are required" });
                }
                const user = yield this.userRepository.findOne({
                    where: { email },
                    select: ["id", "email", "password", "username", "role", "vendeur", "client"],
                    relations: ["vendeur", "client"]
                });
                if (!user) {
                    console.log("User not found:", email);
                    return res.status(401).json({ message: "Invalid credentials" });
                }
                console.log("Attempting password verification for user:", user.email);
                const isPasswordValid = yield (0, bcrypt_1.compare)(password, user.password);
                console.log("Password valid:", isPasswordValid);
                if (!isPasswordValid) {
                    return res.status(401).json({ message: "Invalid credentials" });
                }
                const token = yield (0, authMiddleware_1.generateToken)(user.id);
                user.last_login = new Date();
                yield this.userRepository.save(user);
                const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
                return res.json({
                    token,
                    user: userWithoutPassword
                });
            }
            catch (error) {
                console.error("Login error details:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.userId;
                if (!userId) {
                    return res.status(401).json({ message: "User not authenticated" });
                }
                const user = yield this.userRepository.findOne({
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
            }
            catch (error) {
                console.error("Get profile error:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            return res.json({ message: "Logged out successfully" });
        });
    }
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const user = yield this.userRepository.findOne({ where: { email } });
                if (!user) {
                    return res.status(404).json({ message: "Utilisateur non trouvé" });
                }
                const resetCode = Math.random()
                    .toString(36)
                    .substring(2, 8)
                    .toUpperCase();
                const resetCodeExpires = new Date(Date.now() + 3600000);
                user.resetPasswordCode = resetCode;
                user.resetPasswordExpires = resetCodeExpires;
                yield this.userRepository.save(user);
                return res.json({
                    message: "Code de réinitialisation généré",
                    resetCode,
                });
            }
            catch (error) {
                console.error("Erreur lors de la demande de réinitialisation :", error);
                return res.status(500).json({ message: "Erreur interne du serveur" });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, resetCode } = req.body;
                const user = yield this.userRepository.findOne({
                    where: {
                        email,
                        resetPasswordCode: resetCode,
                        resetPasswordExpires: (0, typeorm_1.MoreThan)(new Date()),
                    },
                });
                if (!user) {
                    return res.status(400).json({ message: "Code invalide ou expiré" });
                }
                const newPassword = Math.random().toString(36).substring(2, 10) +
                    Math.random().toString(36).substring(2, 10);
                user.password = yield (0, bcrypt_1.hash)(newPassword, 10);
                user.resetPasswordCode = null;
                user.resetPasswordExpires = null;
                yield this.userRepository.save(user);
                yield this.emailService.sendPasswordResetEmail(email, newPassword);
                return res.json({
                    message: "Un nouveau mot de passe a été envoyé à votre adresse email",
                });
            }
            catch (error) {
                console.error("Erreur lors de la réinitialisation du mot de passe :", error);
                return res.status(500).json({
                    message: "Une erreur est survenue lors de l'envoi du nouveau mot de passe",
                });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userRepository.find();
                return res.json(users);
            }
            catch (error) {
                console.error("Error fetching users:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findOne({
                    where: { id: parseInt(req.params.id) },
                });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                return res.json(user);
            }
            catch (error) {
                console.error("Error fetching user:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, role } = req.body;
                if (!password) {
                    return res.status(400).json({ message: "Password is required" });
                }
                const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
                const user = this.userRepository.create({
                    username,
                    email,
                    password: hashedPassword,
                    role,
                });
                yield this.userRepository.save(user);
                return res
                    .status(201)
                    .json({ message: "User created successfully", user });
            }
            catch (error) {
                console.error("Error creating user:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findOne({
                    where: { id: parseInt(req.params.id) },
                });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                Object.assign(user, req.body);
                yield this.userRepository.save(user);
                return res.json({ message: "User updated successfully", user });
            }
            catch (error) {
                console.error("Error updating user:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userRepository.findOne({
                    where: { id: parseInt(req.params.id) },
                });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                yield this.userRepository.remove(user);
                return res.json({ message: "User deleted successfully" });
            }
            catch (error) {
                console.error("Error deleting user:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map