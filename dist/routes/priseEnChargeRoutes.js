"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PriseEnChargeController_1 = require("../controllers/PriseEnChargeController");
const router = (0, express_1.Router)();
const priseEnChargeController = new PriseEnChargeController_1.PriseEnChargeController();
router.post('/prises-en-charge', priseEnChargeController.createPriseEnCharge.bind(priseEnChargeController));
router.get('/prises-en-charge', priseEnChargeController.getAllPrisesEnCharge.bind(priseEnChargeController));
router.get('/prises-en-charge/:id', priseEnChargeController.getPriseEnChargeById.bind(priseEnChargeController));
router.put('/prises-en-charge/:id', priseEnChargeController.updatePriseEnCharge.bind(priseEnChargeController));
router.delete('/prises-en-charge/:id', priseEnChargeController.deletePriseEnCharge.bind(priseEnChargeController));
router.post('/prises-en-charge/:id/signature', priseEnChargeController.uploadSignature.bind(priseEnChargeController));
router.get('/prises-en-charge/:id/pdf', priseEnChargeController.generatePDF.bind(priseEnChargeController));
exports.default = router;
//# sourceMappingURL=priseEnChargeRoutes.js.map