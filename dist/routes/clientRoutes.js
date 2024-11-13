"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClientController_1 = require("../controllers/ClientController");
const router = (0, express_1.Router)();
const clientController = new ClientController_1.ClientController();
router.post('/clients', (req, res) => clientController.createClient(req, res));
router.get('/clients', (req, res) => clientController.getAllClients(req, res));
router.get('/clients/:id', (req, res) => clientController.getClientById(req, res));
router.put('/clients/:id', (req, res) => clientController.updateClient(req, res));
router.delete('/clients/:id', (req, res) => clientController.deleteClient(req, res));
router.get('/clients/tous', (req, res) => clientController.getAllClients(req, res));
router.get('/tous', (req, res) => clientController.getAllClients(req, res));
exports.default = router;
//# sourceMappingURL=clientRoutes.js.map