"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FactureArticleController_1 = require("../controllers/FactureArticleController");
const router = (0, express_1.Router)();
const factureArticleController = new FactureArticleController_1.FactureArticleController();
router.post('/factures-article', (req, res) => factureArticleController.createFactureArticle(req, res));
router.get('/factures-article', (req, res) => factureArticleController.getAllFacturesArticle(req, res));
router.get('/factures-article/:id', (req, res) => factureArticleController.getFactureArticleById(req, res));
router.put('/factures-article/:id', (req, res) => factureArticleController.updateFactureArticle(req, res));
router.delete('/factures-article/:id', (req, res) => factureArticleController.deleteFactureArticle(req, res));
router.get('/factures-article/:id/pdf', (req, res) => factureArticleController.generatePDF(req, res));
exports.default = router;
//# sourceMappingURL=factureArticleRoutes.js.map