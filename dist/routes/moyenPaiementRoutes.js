"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MoyenPaiementController_1 = require("../controllers/MoyenPaiementController");
const router = (0, express_1.Router)();
const moyenPaiementController = new MoyenPaiementController_1.MoyenPaiementController();
router.post('/moyens-paiement', (req, res) => moyenPaiementController.createMoyenPaiement(req, res));
router.get('/moyens-paiement', (req, res) => moyenPaiementController.getAllMoyensPaiement(req, res));
router.get('/moyens-paiement/:id', (req, res) => moyenPaiementController.getMoyenPaiementById(req, res));
router.put('/moyens-paiement/:id', (req, res) => moyenPaiementController.updateMoyenPaiement(req, res));
router.delete('/moyens-paiement/:id', (req, res) => moyenPaiementController.deleteMoyenPaiement(req, res));
exports.default = router;
//# sourceMappingURL=moyenPaiementRoutes.js.map