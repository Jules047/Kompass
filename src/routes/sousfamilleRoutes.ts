import { Router } from "express";
import { SousfamilleController } from "../controllers/SousfamilleController";

const router = Router();

router.post("/sousfamilles", SousfamilleController.createSousfamille);
router.get("/sousfamilles", SousfamilleController.getAllSousfamilles);
router.get("/sousfamilles/:id", SousfamilleController.getSousfamilleById);
router.get(
  "/familles/:familleId/sousfamilles",
  SousfamilleController.getSousfamillesByFamilleId
);
router.put("/sousfamilles/:id", SousfamilleController.updateSousfamille);
router.delete("/sousfamilles/:id", SousfamilleController.deleteSousfamille);

export default router;
