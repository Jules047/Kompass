"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StockController_1 = require("../controllers/StockController");
const router = (0, express_1.Router)();
const stockController = new StockController_1.StockController();
router.post('/stock/entry', (req, res) => stockController.addEntry(req, res));
router.post('/stock/exit', (req, res) => stockController.addExit(req, res));
router.get('/stock/status', (req, res) => stockController.getStockStatus(req, res));
exports.default = router;
//# sourceMappingURL=stockRoutes.js.map