"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const FournisseurController_1 = require("../controllers/FournisseurController");
const router = express_1.default.Router();
const fournisseurController = new FournisseurController_1.FournisseurController();
router.post('/', fournisseurController.createFournisseur.bind(fournisseurController));
router.get('/', fournisseurController.getAllFournisseurs.bind(fournisseurController));
router.get('/:id', fournisseurController.getFournisseurById.bind(fournisseurController));
router.put('/:id', fournisseurController.updateFournisseur.bind(fournisseurController));
router.delete('/:id', fournisseurController.deleteFournisseur.bind(fournisseurController));
exports.default = router;
//# sourceMappingURL=fournisseurRoutes.js.map