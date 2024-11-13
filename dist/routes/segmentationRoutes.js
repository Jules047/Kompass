"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SegmentationController_1 = require("../controllers/SegmentationController");
const router = (0, express_1.Router)();
const segmentationController = new SegmentationController_1.SegmentationController();
router.post('/segmentations', (req, res) => segmentationController.createSegmentation(req, res));
router.get('/segmentations', (req, res) => segmentationController.getAllSegmentations(req, res));
router.get('/segmentations/:id', (req, res) => segmentationController.getSegmentationById(req, res));
router.put('/segmentations/:id', (req, res) => segmentationController.updateSegmentation(req, res));
router.delete('/segmentations/:id', (req, res) => segmentationController.deleteSegmentation(req, res));
exports.default = router;
//# sourceMappingURL=segmentationRoutes.js.map