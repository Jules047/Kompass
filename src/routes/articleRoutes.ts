import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';

const router = Router();
const articleController = new ArticleController();

router.post('/articles', (req, res) => articleController.createArticle(req, res));
router.get('/articles', articleController.obtenirTousLesArticles.bind(articleController));
router.get('/articles/:id', articleController.obtenirArticleParId.bind(articleController));
router.get('/articles/stock-bas', articleController.verifierStockBas.bind(articleController));
router.put('/articles/:id', (req, res) => articleController.updateArticle(req, res));
router.delete('/articles/:id', (req, res) => articleController.deleteArticle(req, res));

export default router;
