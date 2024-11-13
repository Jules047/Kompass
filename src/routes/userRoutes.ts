import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.get(
  "/",
  authMiddleware,
  userController.getAllUsers.bind(userController)
);
router.post(
  "/",
  authMiddleware,
  userController.createUser.bind(userController)
);
router.put(
  "/:id",
  authMiddleware,
  userController.updateUser.bind(userController)
);
router.delete(
  "/:id",
  authMiddleware,
  userController.deleteUser.bind(userController)
);

export default router;
