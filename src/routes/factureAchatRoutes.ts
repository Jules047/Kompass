import express from "express";
import { FactureAchatController } from "../controllers/FactureAchatController";

const router = express.Router();
const factureAchatController = new FactureAchatController();

router.get("/", (req, res) =>
  factureAchatController.getAllFacturesAchat(req, res)
);

// Update other routes similarly
router.post("/", (req, res) =>
  factureAchatController.createFactureAchat(req, res)
);
router.get("/:id", (req, res) =>
  factureAchatController.getFactureAchatById(req, res)
);
router.put("/:id", (req, res) =>
  factureAchatController.updateFactureAchat(req, res)
);
router.delete("/:id", (req, res) =>
  factureAchatController.deleteFactureAchat(req, res)
);
router.get("/:id/pdf", (req, res) =>
  factureAchatController.generatePDF(req, res)
);

export default router;
