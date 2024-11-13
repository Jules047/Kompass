// import { Router } from 'express';
// import { FactureArticleController } from '../controllers/FactureArticleController';

// const router = Router();
// const factureArticleController = new FactureArticleController();

// router.post('/factures-article', (req, res) => factureArticleController.createFactureArticle(req, res));
// router.get('/factures-article', (req, res) => factureArticleController.getAllFacturesArticle(req, res));
// router.get('/factures-article/:id', (req, res) => factureArticleController.getFactureArticleById(req, res));
// router.put('/factures-article/:id', (req, res) => factureArticleController.updateFactureArticle(req, res));
// router.delete('/factures-article/:id', (req, res) => factureArticleController.deleteFactureArticle(req, res));
// router.get('/factures-article/:id/pdf', (req, res) => factureArticleController.generatePDF(req, res));

// export default router;

import { Router } from 'express';
import { FactureArticleController } from '../controllers/FactureArticleController';

const router = Router();
const factureArticleController = new FactureArticleController();

router.post('/factures-article', (req, res) => factureArticleController.createFactureArticle(req, res));
router.get('/factures-article', (req, res) => factureArticleController.getAllFacturesArticle(req, res));
router.get('/factures-article/:id', (req, res) => factureArticleController.getFactureArticleById(req, res));
router.put('/factures-article/:id', (req, res) => factureArticleController.updateFactureArticle(req, res));
router.delete('/factures-article/:id', (req, res) => factureArticleController.deleteFactureArticle(req, res));
router.get('/factures-article/:id/pdf', (req, res) => factureArticleController.generatePDF(req, res));

export default router;
