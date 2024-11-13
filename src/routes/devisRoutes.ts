// import express from 'express';
// import { DevisController } from '../controllers/DevisController';

// const router = express.Router();
// const devisController = new DevisController();

// router.post('/', devisController.createDevis.bind(devisController));
// router.get('/', devisController.getAllDevis.bind(devisController));
// router.get('/:id', devisController.getDevisById.bind(devisController));
// router.put('/:id', devisController.updateDevis.bind(devisController));
// router.delete('/:id', devisController.deleteDevis.bind(devisController));
// router.get('/:id/pdf', devisController.generatePDF.bind(devisController));

// export default router;

import express from 'express';
import { DevisController } from '../controllers/DevisController';

const router = express.Router();
const devisController = new DevisController();

router.post('/', devisController.createDevis.bind(devisController));
router.get('/', devisController.getAllDevis.bind(devisController));
router.get('/:id', devisController.getDevisById.bind(devisController));
router.put('/:id', devisController.updateDevis.bind(devisController));
router.delete('/:id', devisController.deleteDevis.bind(devisController));
router.post('/:id/signature', devisController.uploadSignature.bind(devisController));
router.get('/:id/pdf', devisController.generatePDF.bind(devisController));

export default router;
