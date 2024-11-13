"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const HistoriqueFacturationController_1 = require("../controllers/HistoriqueFacturationController");
const checkJwt_1 = require("../middlewares/checkJwt");
const router = express_1.default.Router();
const historiqueController = new HistoriqueFacturationController_1.HistoriqueFacturationController();
router.get("/historique-facturation-achat", checkJwt_1.checkJwt, (req, res) => historiqueController.getAllHistorique(req, res));
exports.default = router;
//# sourceMappingURL=historiqueFacturationRoutes.js.map