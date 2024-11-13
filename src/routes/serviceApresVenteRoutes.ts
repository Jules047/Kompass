import { Router } from 'express';
import { ServiceApresVenteController } from '../controllers/ServiceApresVenteController';

const router = Router();
const serviceApresVenteController = new ServiceApresVenteController();

router.post('/service-apres-vente', serviceApresVenteController.createServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente', serviceApresVenteController.getAllServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente/:id', serviceApresVenteController.getServiceApresVenteById.bind(serviceApresVenteController));
router.put('/service-apres-vente/:id', serviceApresVenteController.updateServiceApresVente.bind(serviceApresVenteController));
router.delete('/service-apres-vente/:id', serviceApresVenteController.deleteServiceApresVente.bind(serviceApresVenteController));
router.get('/service-apres-vente/:id/pdf', serviceApresVenteController.generatePDF.bind(serviceApresVenteController));

export default router;
