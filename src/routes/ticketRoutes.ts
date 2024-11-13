import { Router } from 'express';
import { TicketController } from '../controllers/TicketController';

const router = Router();
const ticketController = new TicketController();

router.post('/ticket', ticketController.createTicket.bind(ticketController));
router.get('/ticket', ticketController.getAllTickets.bind(ticketController));
router.get('/ticket/:id', ticketController.getTicketById.bind(ticketController));
router.put('/ticket/:id', ticketController.updateTicket.bind(ticketController));
router.delete('/ticket/:id', ticketController.deleteTicket.bind(ticketController));
router.get('/ticket/:id/pdf', ticketController.generatePDF.bind(ticketController));

export default router;
