"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ServiceApresVenteController_1 = require("../controllers/ServiceApresVenteController");
const router = (0, express_1.Router)();
const serviceApresVenteController = new ServiceApresVenteController_1.ServiceApresVenteController();
router.post('/service-apres-vente', serviceApresVenteController.createServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente', serviceApresVenteController.getAllServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente/:id', serviceApresVenteController.getServiceApresVenteById.bind(serviceApresVenteController));
router.put('/service-apres-vente/:id', serviceApresVenteController.updateServiceApresVente.bind(serviceApresVenteController));
router.delete('/service-apres-vente/:id', serviceApresVenteController.deleteServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente/:id/pdf', serviceApresVenteController.generatePDF.bind(serviceApresVenteController));
exports.default = router;
//# sourceMappingURL=serviceApresVenteRoutes.js.map