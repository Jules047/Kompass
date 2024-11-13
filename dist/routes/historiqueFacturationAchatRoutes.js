"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const HistoriqueFacturationAchatController_1 = require("../controllers/HistoriqueFacturationAchatController");
const router = express_1.default.Router();
const historiqueController = new HistoriqueFacturationAchatController_1.HistoriqueFacturationAchatController();
router.get('/', historiqueController.getAllHistorique.bind(historiqueController));
router.get('/:id', historiqueController.getHistoriqueById.bind(historiqueController));
exports.default = router;
//# sourceMappingURL=historiqueFacturationAchatRoutes.js.map