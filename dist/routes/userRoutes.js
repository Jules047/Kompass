"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
router.get("/", authMiddleware_1.authMiddleware, userController.getAllUsers.bind(userController));
router.post("/", authMiddleware_1.authMiddleware, userController.createUser.bind(userController));
router.put("/:id", authMiddleware_1.authMiddleware, userController.updateUser.bind(userController));
router.delete("/:id", authMiddleware_1.authMiddleware, userController.deleteUser.bind(userController));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map