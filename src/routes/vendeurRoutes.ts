import { Router } from 'express';
import { VendeurController } from '../controllers/VendeurController';

const router = Router();
const vendeurController = new VendeurController();

router.post('/vendeurs', vendeurController.createVendeur.bind(vendeurController));
router.get('/vendeurs', vendeurController.getAllVendeurs.bind(vendeurController));
router.get('/vendeurs/:id', vendeurController.getVendeurById.bind(vendeurController));
router.put('/vendeurs/:id', vendeurController.updateVendeur.bind(vendeurController));
router.delete('/vendeurs/:id', vendeurController.deleteVendeur.bind(vendeurController));

export default router;
