"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SousfamilleController_1 = require("../controllers/SousfamilleController");
const router = (0, express_1.Router)();
router.post("/sousfamilles", SousfamilleController_1.SousfamilleController.createSousfamille);
router.get("/sousfamilles", SousfamilleController_1.SousfamilleController.getAllSousfamilles);
router.get("/sousfamilles/:id", SousfamilleController_1.SousfamilleController.getSousfamilleById);
router.get("/familles/:familleId/sousfamilles", SousfamilleController_1.SousfamilleController.getSousfamillesByFamilleId);
router.put("/sousfamilles/:id", SousfamilleController_1.SousfamilleController.updateSousfamille);
router.delete("/sousfamilles/:id", SousfamilleController_1.SousfamilleController.deleteSousfamille);
exports.default = router;
//# sourceMappingURL=sousfamilleRoutes.js.map