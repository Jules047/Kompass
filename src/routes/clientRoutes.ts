import { Router } from 'express';
import { ClientController } from '../controllers/ClientController';

const router = Router();
const clientController = new ClientController();

router.post('/clients', (req, res) => clientController.createClient(req, res));
router.get('/clients', (req, res) => clientController.getAllClients(req, res));
router.get('/clients/:id', (req, res) => clientController.getClientById(req, res));
router.put('/clients/:id', (req, res) => clientController.updateClient(req, res));
router.delete('/clients/:id', (req, res) => clientController.deleteClient(req, res));
router.get('/clients/tous', (req, res) => clientController.getAllClients(req, res));
router.get('/tous', (req, res) => clientController.getAllClients(req, res));



export default router;
