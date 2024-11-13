"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DevisController_1 = require("../controllers/DevisController");
const router = express_1.default.Router();
const devisController = new DevisController_1.DevisController();
router.post('/', devisController.createDevis.bind(devisController));
router.get('/', devisController.getAllDevis.bind(devisController));
router.get('/:id', devisController.getDevisById.bind(devisController));
router.put('/:id', devisController.updateDevis.bind(devisController));
router.delete('/:id', devisController.deleteDevis.bind(devisController));
router.post('/:id/signature', devisController.uploadSignature.bind(devisController));
router.get('/:id/pdf', devisController.generatePDF.bind(devisController));
exports.default = router;
//# sourceMappingURL=devisRoutes.js.map