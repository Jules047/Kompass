import express from 'express';
import { HistoriqueFacturationAchatController } from '../controllers/HistoriqueFacturationAchatController';

const router = express.Router();
const historiqueController = new HistoriqueFacturationAchatController();

router.get('/', historiqueController.getAllHistorique.bind(historiqueController));
router.get('/:id', historiqueController.getHistoriqueById.bind(historiqueController));

export default router;
