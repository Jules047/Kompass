"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ArticleController_1 = require("../controllers/ArticleController");
const router = (0, express_1.Router)();
const articleController = new ArticleController_1.ArticleController();
router.post('/articles', (req, res) => articleController.createArticle(req, res));
router.get('/articles', articleController.obtenirTousLesArticles.bind(articleController));
router.get('/articles/:id', articleController.obtenirArticleParId.bind(articleController));
router.get('/articles/stock-bas', articleController.verifierStockBas.bind(articleController));
router.put('/articles/:id', (req, res) => articleController.updateArticle(req, res));
router.delete('/articles/:id', (req, res) => articleController.deleteArticle(req, res));
exports.default = router;
//# sourceMappingURL=articleRoutes.js.map