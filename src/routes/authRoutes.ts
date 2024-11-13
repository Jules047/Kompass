import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const authController = new AuthController();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get(
  "/profile",
  authMiddleware,
  authController.getProfile.bind(authController)
);
router.post(
  "/logout",
  authMiddleware,
  authController.logout.bind(authController)
);
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController)
);
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController)
);

// New routes for user management
router.get(
  "/users",
  authMiddleware,
  authController.getAllUsers.bind(authController)
);
router.get(
  "/users/:id",
  authMiddleware,
  authController.getUserById.bind(authController)
);
router.post(
  "/users",
  authMiddleware,
  authController.createUser.bind(authController)
);
router.put(
  "/users/:id",
  authMiddleware,
  authController.updateUser.bind(authController)
);
router.delete(
  "/users/:id",
  authMiddleware,
  authController.deleteUser.bind(authController)
);

export default router;
