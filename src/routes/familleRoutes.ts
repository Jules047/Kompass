import { Router } from 'express';
import { FamilleController } from '../controllers/FamilleController';

const router = Router();

// Créer une nouvelle famille
router.post('/familles', FamilleController.createFamille);

// Récupérer toutes les familles
router.get('/familles', FamilleController.getAllFamilles);

// Récupérer une famille par ID
router.get('/familles/:id', FamilleController.getFamilleById);

// Mettre à jour une famille par ID
router.put('/familles/:id', FamilleController.updateFamille);

// Supprimer une famille par ID
router.delete('/familles/:id', FamilleController.deleteFamille);

export default router;
