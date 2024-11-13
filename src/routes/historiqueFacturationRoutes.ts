import express from "express";
import { HistoriqueFacturationController } from "../controllers/HistoriqueFacturationController";
import { checkJwt } from "../middlewares/checkJwt";

const router = express.Router();
const historiqueController = new HistoriqueFacturationController();

router.get("/historique-facturation-achat", checkJwt, (req, res) =>
  historiqueController.getAllHistorique(req, res)
);

export default router;
