"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleController = void 0;
const data_source_1 = require("../data-source");
const Article_1 = require("../entities/Article");
const Famille_1 = require("../entities/Famille");
const Stock_1 = require("../entities/Stock");
class ArticleController {
    constructor() {
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.familleRepository = data_source_1.AppDataSource.getRepository(Famille_1.Famille);
        this.stockRepository = data_source_1.AppDataSource.getRepository(Stock_1.Stock);
    }
    obtenirTousLesArticles(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const articles = yield this.articleRepository.find({
                    relations: ["famille", "sousfamille"],
                });
                for (let article of articles) {
                    const totalStock = yield this.stockRepository
                        .createQueryBuilder("stock")
                        .select("SUM(stock.entree) - SUM(stock.sortie)", "total")
                        .where("stock.articles_id = :id", { id: article.id })
                        .getRawOne();
                    article.quantite = parseFloat(totalStock.total) || 0;
                }
                yield this.articleRepository.save(articles);
                response.json(articles);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des articles:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération des articles",
                    error,
                });
            }
        });
    }
    mettreAJourQuantiteArticle(articleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const totalStock = yield this.stockRepository
                .createQueryBuilder("stock")
                .select("SUM(stock.entree) - SUM(stock.sortie)", "total")
                .where("stock.articles_id = :id", { id: articleId })
                .getRawOne();
            const article = yield this.articleRepository.findOne({
                where: { id: articleId },
            });
            if (article) {
                article.quantite = parseFloat(totalStock.total) || 0;
                yield this.articleRepository.save(article);
            }
        });
    }
    obtenirArticleParId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const article = yield this.articleRepository.findOne({
                    where: { id },
                    relations: ["famille"],
                });
                if (article) {
                    response.json(article);
                }
                else {
                    response.status(404).json({ message: "Article non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'article:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération de l'article",
                    error,
                });
            }
        });
    }
    verifierStockBas(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const articlesStockBas = yield this.articleRepository
                    .createQueryBuilder("article")
                    .where("article.quantite <= :seuil", { seuil: 2 })
                    .getMany();
                response.json(articlesStockBas);
            }
            catch (error) {
                console.error("Erreur lors de la vérification du stock bas:", error);
                response.status(500).json({
                    message: "Erreur lors de la vérification du stock bas",
                    error,
                });
            }
        });
    }
    createArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { designation, type, prix_achat, prix_ht, marge_pourcent, marge_num, prix_ttc, complet, famille_id, sousfamille_id } = request.body;
                const famille = yield this.familleRepository.findOne({
                    where: { id: famille_id },
                    relations: ['sousfamilles']
                });
                if (!famille) {
                    return response.status(404).json({ message: "Famille non trouvée" });
                }
                const article = this.articleRepository.create({
                    designation,
                    type,
                    prix_achat,
                    prix_ht,
                    marge_pourcent,
                    marge_num,
                    prix_ttc,
                    complet,
                    famille_id,
                    sousfamille_id,
                    famille,
                });
                const savedArticle = yield this.articleRepository.save(article);
                const completeArticle = yield this.articleRepository.findOne({
                    where: { id: savedArticle.id },
                    relations: ["famille", "sousfamille"]
                });
                return response.status(201).json(completeArticle);
            }
            catch (error) {
                console.error("Erreur lors de la création de l'article:", error);
                return response.status(500).json({ message: "Erreur lors de la création de l'article", error });
            }
        });
    }
    updateArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const article = yield this.articleRepository.findOne({ where: { id } });
                if (!article) {
                    return response.status(404).json({ message: "Article non trouvé" });
                }
                const updatedArticle = Object.assign(article, request.body);
                yield this.articleRepository.save(updatedArticle);
                return response.json({ message: "Article mis à jour", article: updatedArticle });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour de l'article:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la mise à jour de l'article", error });
            }
        });
    }
    deleteArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const article = yield queryRunner.manager.findOne(Article_1.Article, {
                    where: { id },
                    relations: ["stocks"],
                });
                if (!article) {
                    yield queryRunner.rollbackTransaction();
                    return response.status(404).json({ message: "Article non trouvé" });
                }
                yield queryRunner.query(`DELETE FROM facture_achat_detail WHERE article_id = $1`, [id]);
                yield queryRunner.query(`DELETE FROM stocks WHERE articles_id = $1`, [
                    id,
                ]);
                yield queryRunner.manager.remove(Article_1.Article, article);
                yield queryRunner.commitTransaction();
                return response.json({
                    message: "Article et données associées supprimés avec succès",
                    success: true,
                });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la suppression de l'article:", error);
                return response.status(500).json({
                    message: "Erreur lors de la suppression de l'article",
                    error,
                    success: false,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
}
exports.ArticleController = ArticleController;
//# sourceMappingURL=ArticleController.js.map