"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TicketController_1 = require("../controllers/TicketController");
const router = (0, express_1.Router)();
const ticketController = new TicketController_1.TicketController();
router.post('/ticket', ticketController.createTicket.bind(ticketController));
router.get('/ticket', ticketController.getAllTickets.bind(ticketController));
router.get('/ticket/:id', ticketController.getTicketById.bind(ticketController));
router.put('/ticket/:id', ticketController.updateTicket.bind(ticketController));
router.delete('/ticket/:id', ticketController.deleteTicket.bind(ticketController));
router.get('/ticket/:id/pdf', ticketController.generatePDF.bind(ticketController));
exports.default = router;
//# sourceMappingURL=ticketRoutes.js.map