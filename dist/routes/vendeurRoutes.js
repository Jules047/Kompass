"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VendeurController_1 = require("../controllers/VendeurController");
const router = (0, express_1.Router)();
const vendeurController = new VendeurController_1.VendeurController();
router.post('/vendeurs', vendeurController.createVendeur.bind(vendeurController));
router.get('/vendeurs', vendeurController.getAllVendeurs.bind(vendeurController));
router.get('/vendeurs/:id', vendeurController.getVendeurById.bind(vendeurController));
router.put('/vendeurs/:id', vendeurController.updateVendeur.bind(vendeurController));
router.delete('/vendeurs/:id', vendeurController.deleteVendeur.bind(vendeurController));
exports.default = router;
//# sourceMappingURL=vendeurRoutes.js.map