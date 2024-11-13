import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Stock } from "../entities/Stock";
import { Article } from "../entities/Article";
import { ArticleController } from "./ArticleController";
import { QueryRunner } from "typeorm";
import { FactureAchat } from "../entities/FactureAchat";

export class StockController {
  private stockRepository = AppDataSource.getRepository(Stock);
  private articleRepository = AppDataSource.getRepository(Article);
  private articleController = new ArticleController();

  async updateStockFromFactureAchat(
    queryRunner: QueryRunner,
    factureAchat: FactureAchat
  ) {
    try {
      await queryRunner.query("SELECT update_stock_from_facture_achat($1)", [
        factureAchat.id,
      ]);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du stock depuis la facture d'achat:",
        error
      );
      throw error;
    }
  }

  async updateStockFromCommande(queryRunner: QueryRunner, commandeId: number) {
    try {
      await queryRunner.query("SELECT update_stock_from_commande($1)", [
        commandeId,
      ]);
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du stock depuis la commande:",
        error
      );
      throw error;
    }
  }

  async addEntry(request: Request, response: Response): Promise<Response | void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { articles_id, entree } = request.body;

      const article = await queryRunner.manager.findOne(Article, {
        where: { id: articles_id },
      });

      if (!article) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Article non trouvé" });
      }

      const stock = queryRunner.manager.create(Stock, {
        articles_id,
        entree,
        sortie: 0,
        date_entree: new Date(),
      });

      await queryRunner.manager.save(stock);
      await queryRunner.commitTransaction();

      await this.articleController.mettreAJourQuantiteArticle(articles_id);
      const updatedArticle = await this.articleRepository.findOne({
        where: { id: articles_id },
      });

      return response.json({
        message: "Entrée de stock ajoutée",
        stock,
        article: updatedArticle,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de l'ajout d'entrée de stock:", error);
      return response.status(500).json({
        message: "Erreur lors de l'ajout d'entrée de stock",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }
  async addExit(request: Request, response: Response): Promise<Response | void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { articles_id, sortie } = request.body;

      const article = await queryRunner.manager.findOne(Article, {
        where: { id: articles_id },
      });

      if (!article) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Article non trouvé" });
      }

      if (article.quantite < sortie) {
        await queryRunner.rollbackTransaction();
        return response
          .status(400)
          .json({ message: "Quantité insuffisante en stock" });
      }

      const stock = queryRunner.manager.create(Stock, {
        articles_id,
        entree: 0,
        sortie,
        date_sortie: new Date(),
      });

      await queryRunner.manager.save(stock);
      await queryRunner.commitTransaction();

      await this.articleController.mettreAJourQuantiteArticle(articles_id);
      const updatedArticle = await this.articleRepository.findOne({
        where: { id: articles_id },
      });

      if (updatedArticle && updatedArticle.quantite <= 2) {
        return response.json({
          message: `Sortie de stock ajoutée. ALERTE: La quantité de ${updatedArticle.designation} est basse (${updatedArticle.quantite} unités restantes)!`,
          stock,
          article: updatedArticle,
          isLowStock: true,
        });
      } else {
        return response.json({
          message: "Sortie de stock ajoutée",
          stock,
          article: updatedArticle,
          isLowStock: false,
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de l'ajout de sortie de stock:", error);
      return response.status(500).json({
        message: "Erreur lors de l'ajout de sortie de stock",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }
  async getStockStatus(request: Request, response: Response) {
    try {
      const stocks = await this.stockRepository
        .createQueryBuilder("stock")
        .select([
          "stock.articles_id as id",
          "MAX(stock.date_entree) as date_entree",
          "MAX(stock.date_sortie) as date_sortie",
          "SUM(stock.entree) - SUM(stock.sortie) as quantite",
          "CASE WHEN SUM(stock.entree) - SUM(stock.sortie) <= 2 THEN true ELSE false END as is_low_stock",
        ])
        .addSelect(
          "MAX(CASE WHEN stock.date_entree = (SELECT MAX(s2.date_entree) FROM stocks s2 WHERE s2.articles_id = stock.articles_id) THEN stock.entree ELSE NULL END)",
          "derniere_entree"
        )
        .addSelect(
          "MAX(CASE WHEN stock.date_sortie = (SELECT MAX(s2.date_sortie) FROM stocks s2 WHERE s2.articles_id = stock.articles_id) THEN stock.sortie ELSE NULL END)",
          "derniere_sortie"
        )
        .groupBy("stock.articles_id")
        .getRawMany();

      const articles = await this.articleRepository.find();
      const stockStatus = articles.map((article) => {
        const stock = stocks.find((s) => s.id === article.id);
        const quantite = stock ? parseFloat(stock.quantite) || 0 : 0;
        return {
          ...article,
          quantite,
          date_entree: stock ? stock.date_entree : null,
          date_sortie: stock ? stock.date_sortie : null,
          derniere_entree: stock
            ? parseFloat(stock.derniere_entree) || null
            : null,
          derniere_sortie: stock
            ? parseFloat(stock.derniere_sortie) || null
            : null,
          isLowStock: quantite <= 2,
        };
      });

      response.json(stockStatus);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du statut des stocks:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération du statut des stocks",
        error,
      });
    }
  }

  // Méthode pour créer l'index sur la colonne de stock bas
  async createLowStockIndex() {
    try {
      await this.stockRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_low_stock 
        ON stocks ((entree - sortie))
        WHERE (entree - sortie) <= 2
      `);
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'index de stock bas:",
        error
      );
      throw error;
    }
  }
}
