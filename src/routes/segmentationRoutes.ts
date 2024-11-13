import { Router } from 'express';
import { SegmentationController } from '../controllers/SegmentationController';

const router = Router();
const segmentationController = new SegmentationController();

router.post('/segmentations', (req, res) => segmentationController.createSegmentation(req, res));
router.get('/segmentations', (req, res) => segmentationController.getAllSegmentations(req, res));
router.get('/segmentations/:id', (req, res) => segmentationController.getSegmentationById(req, res));
router.put('/segmentations/:id', (req, res) => segmentationController.updateSegmentation(req, res));
router.delete('/segmentations/:id', (req, res) => segmentationController.deleteSegmentation(req, res));

export default router;
