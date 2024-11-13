"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FamilleController_1 = require("../controllers/FamilleController");
const router = (0, express_1.Router)();
router.post('/familles', FamilleController_1.FamilleController.createFamille);
router.get('/familles', FamilleController_1.FamilleController.getAllFamilles);
router.get('/familles/:id', FamilleController_1.FamilleController.getFamilleById);
router.put('/familles/:id', FamilleController_1.FamilleController.updateFamille);
router.delete('/familles/:id', FamilleController_1.FamilleController.deleteFamille);
exports.default = router;
//# sourceMappingURL=familleRoutes.js.map