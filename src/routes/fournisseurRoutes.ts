import express from 'express';
import { FournisseurController } from '../controllers/FournisseurController';

const router = express.Router();
const fournisseurController = new FournisseurController();

router.post('/', fournisseurController.createFournisseur.bind(fournisseurController));
router.get('/', fournisseurController.getAllFournisseurs.bind(fournisseurController));
router.get('/:id', fournisseurController.getFournisseurById.bind(fournisseurController));
router.put('/:id', fournisseurController.updateFournisseur.bind(fournisseurController));
router.delete('/:id', fournisseurController.deleteFournisseur.bind(fournisseurController));

export default router;
