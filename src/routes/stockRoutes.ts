import { Router } from 'express';
import { StockController } from '../controllers/StockController';

const router = Router();
const stockController = new StockController();

router.post('/stock/entry', (req, res) => stockController.addEntry(req, res));
router.post('/stock/exit', (req, res) => stockController.addExit(req, res));
router.get('/stock/status', (req, res) => stockController.getStockStatus(req, res));

export default router;