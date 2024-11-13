import { Router } from 'express';
import { MoyenPaiementController } from '../controllers/MoyenPaiementController';

const router = Router();
const moyenPaiementController = new MoyenPaiementController();

router.post('/moyens-paiement', (req, res) => moyenPaiementController.createMoyenPaiement(req, res));
router.get('/moyens-paiement', (req, res) => moyenPaiementController.getAllMoyensPaiement(req, res));
router.get('/moyens-paiement/:id', (req, res) => moyenPaiementController.getMoyenPaiementById(req, res));
router.put('/moyens-paiement/:id', (req, res) => moyenPaiementController.updateMoyenPaiement(req, res));
router.delete('/moyens-paiement/:id', (req, res) => moyenPaiementController.deleteMoyenPaiement(req, res));

export default router;
