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
exports.StockController = void 0;
const data_source_1 = require("../data-source");
const Stock_1 = require("../entities/Stock");
const Article_1 = require("../entities/Article");
const ArticleController_1 = require("./ArticleController");
class StockController {
    constructor() {
        this.stockRepository = data_source_1.AppDataSource.getRepository(Stock_1.Stock);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.articleController = new ArticleController_1.ArticleController();
    }
    updateStockFromFactureAchat(queryRunner, factureAchat) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield queryRunner.query("SELECT update_stock_from_facture_achat($1)", [
                    factureAchat.id,
                ]);
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du stock depuis la facture d'achat:", error);
                throw error;
            }
        });
    }
    updateStockFromCommande(queryRunner, commandeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield queryRunner.query("SELECT update_stock_from_commande($1)", [
                    commandeId,
                ]);
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du stock depuis la commande:", error);
                throw error;
            }
        });
    }
    addEntry(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const { articles_id, entree } = request.body;
                const article = yield queryRunner.manager.findOne(Article_1.Article, {
                    where: { id: articles_id },
                });
                if (!article) {
                    yield queryRunner.rollbackTransaction();
                    return response.status(404).json({ message: "Article non trouvé" });
                }
                const stock = queryRunner.manager.create(Stock_1.Stock, {
                    articles_id,
                    entree,
                    sortie: 0,
                    date_entree: new Date(),
                });
                yield queryRunner.manager.save(stock);
                yield queryRunner.commitTransaction();
                yield this.articleController.mettreAJourQuantiteArticle(articles_id);
                const updatedArticle = yield this.articleRepository.findOne({
                    where: { id: articles_id },
                });
                return response.json({
                    message: "Entrée de stock ajoutée",
                    stock,
                    article: updatedArticle,
                });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de l'ajout d'entrée de stock:", error);
                return response.status(500).json({
                    message: "Erreur lors de l'ajout d'entrée de stock",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    addExit(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const { articles_id, sortie } = request.body;
                const article = yield queryRunner.manager.findOne(Article_1.Article, {
                    where: { id: articles_id },
                });
                if (!article) {
                    yield queryRunner.rollbackTransaction();
                    return response.status(404).json({ message: "Article non trouvé" });
                }
                if (article.quantite < sortie) {
                    yield queryRunner.rollbackTransaction();
                    return response
                        .status(400)
                        .json({ message: "Quantité insuffisante en stock" });
                }
                const stock = queryRunner.manager.create(Stock_1.Stock, {
                    articles_id,
                    entree: 0,
                    sortie,
                    date_sortie: new Date(),
                });
                yield queryRunner.manager.save(stock);
                yield queryRunner.commitTransaction();
                yield this.articleController.mettreAJourQuantiteArticle(articles_id);
                const updatedArticle = yield this.articleRepository.findOne({
                    where: { id: articles_id },
                });
                if (updatedArticle && updatedArticle.quantite <= 2) {
                    return response.json({
                        message: `Sortie de stock ajoutée. ALERTE: La quantité de ${updatedArticle.designation} est basse (${updatedArticle.quantite} unités restantes)!`,
                        stock,
                        article: updatedArticle,
                        isLowStock: true,
                    });
                }
                else {
                    return response.json({
                        message: "Sortie de stock ajoutée",
                        stock,
                        article: updatedArticle,
                        isLowStock: false,
                    });
                }
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de l'ajout de sortie de stock:", error);
                return response.status(500).json({
                    message: "Erreur lors de l'ajout de sortie de stock",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    getStockStatus(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stocks = yield this.stockRepository
                    .createQueryBuilder("stock")
                    .select([
                    "stock.articles_id as id",
                    "MAX(stock.date_entree) as date_entree",
                    "MAX(stock.date_sortie) as date_sortie",
                    "SUM(stock.entree) - SUM(stock.sortie) as quantite",
                    "CASE WHEN SUM(stock.entree) - SUM(stock.sortie) <= 2 THEN true ELSE false END as is_low_stock",
                ])
                    .addSelect("MAX(CASE WHEN stock.date_entree = (SELECT MAX(s2.date_entree) FROM stocks s2 WHERE s2.articles_id = stock.articles_id) THEN stock.entree ELSE NULL END)", "derniere_entree")
                    .addSelect("MAX(CASE WHEN stock.date_sortie = (SELECT MAX(s2.date_sortie) FROM stocks s2 WHERE s2.articles_id = stock.articles_id) THEN stock.sortie ELSE NULL END)", "derniere_sortie")
                    .groupBy("stock.articles_id")
                    .getRawMany();
                const articles = yield this.articleRepository.find();
                const stockStatus = articles.map((article) => {
                    const stock = stocks.find((s) => s.id === article.id);
                    const quantite = stock ? parseFloat(stock.quantite) || 0 : 0;
                    return Object.assign(Object.assign({}, article), { quantite, date_entree: stock ? stock.date_entree : null, date_sortie: stock ? stock.date_sortie : null, derniere_entree: stock
                            ? parseFloat(stock.derniere_entree) || null
                            : null, derniere_sortie: stock
                            ? parseFloat(stock.derniere_sortie) || null
                            : null, isLowStock: quantite <= 2 });
                });
                response.json(stockStatus);
            }
            catch (error) {
                console.error("Erreur lors de la récupération du statut des stocks:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération du statut des stocks",
                    error,
                });
            }
        });
    }
    createLowStockIndex() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.stockRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_low_stock 
        ON stocks ((entree - sortie))
        WHERE (entree - sortie) <= 2
      `);
            }
            catch (error) {
                console.error("Erreur lors de la création de l'index de stock bas:", error);
                throw error;
            }
        });
    }
}
exports.StockController = StockController;
//# sourceMappingURL=StockController.js.map