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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const bcrypt_1 = require("bcrypt");
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield this.userRepository.find({
                    select: ["id", "username", "email", "role", "created_at", "last_login"],
                });
                return res.json(users);
            }
            catch (error) {
                console.error("Error fetching users:", error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, email, password, role } = req.body;
                const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
                const user = this.userRepository.create({
                    username,
                    email,
                    password: hashedPassword,
                    role,
                });
                yield this.userRepository.save(user);
                return res.status(201).json({ message: "User created successfully" });
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
                const { id } = req.params;
                const { username, email, role, password } = req.body;
                const user = yield this.userRepository.findOne({
                    where: { id: parseInt(id) },
                });
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                user.username = username;
                user.email = email;
                user.role = role;
                if (password && password.trim()) {
                    console.log("Hashing new password for user:", user.username);
                    const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
                    user.password = hashedPassword;
                }
                const savedUser = yield this.userRepository.save(user);
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
                const { id } = req.params;
                const user = yield this.userRepository.findOne({
                    where: { id: parseInt(id) },
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
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map