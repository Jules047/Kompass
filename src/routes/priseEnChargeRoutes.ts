// import { Router } from 'express';
// import { PriseEnChargeController } from '../controllers/PriseEnChargeController';

// const router = Router();
// const priseEnChargeController = new PriseEnChargeController();

// router.post('/prises-en-charge', priseEnChargeController.createPriseEnCharge.bind(priseEnChargeController));
// router.get('/prises-en-charge', priseEnChargeController.getAllPrisesEnCharge.bind(priseEnChargeController));
// router.get('/prises-en-charge/:id', priseEnChargeController.getPriseEnChargeById.bind(priseEnChargeController));
// router.put('/prises-en-charge/:id', priseEnChargeController.updatePriseEnCharge.bind(priseEnChargeController));
// router.delete('/prises-en-charge/:id', priseEnChargeController.deletePriseEnCharge.bind(priseEnChargeController));

// export default router;

import { Router } from 'express';
import { PriseEnChargeController } from '../controllers/PriseEnChargeController';

const router = Router();
const priseEnChargeController = new PriseEnChargeController();

router.post('/prises-en-charge', priseEnChargeController.createPriseEnCharge.bind(priseEnChargeController));
router.get('/prises-en-charge', priseEnChargeController.getAllPrisesEnCharge.bind(priseEnChargeController));
router.get('/prises-en-charge/:id', priseEnChargeController.getPriseEnChargeById.bind(priseEnChargeController));
router.put('/prises-en-charge/:id', priseEnChargeController.updatePriseEnCharge.bind(priseEnChargeController));
router.delete('/prises-en-charge/:id', priseEnChargeController.deletePriseEnCharge.bind(priseEnChargeController));
router.post('/prises-en-charge/:id/signature', priseEnChargeController.uploadSignature.bind(priseEnChargeController));
router.get('/prises-en-charge/:id/pdf', priseEnChargeController.generatePDF.bind(priseEnChargeController));

export default router;
