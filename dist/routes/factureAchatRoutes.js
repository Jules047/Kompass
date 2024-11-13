"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FactureAchatController_1 = require("../controllers/FactureAchatController");
const router = express_1.default.Router();
const factureAchatController = new FactureAchatController_1.FactureAchatController();
router.get("/", (req, res) => factureAchatController.getAllFacturesAchat(req, res));
router.post("/", (req, res) => factureAchatController.createFactureAchat(req, res));
router.get("/:id", (req, res) => factureAchatController.getFactureAchatById(req, res));
router.put("/:id", (req, res) => factureAchatController.updateFactureAchat(req, res));
router.delete("/:id", (req, res) => factureAchatController.deleteFactureAchat(req, res));
router.get("/:id/pdf", (req, res) => factureAchatController.generatePDF(req, res));
exports.default = router;
//# sourceMappingURL=factureAchatRoutes.js.map