import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { Article } from "../entities/Article";
import { Famille } from "../entities/Famille";
import { Stock } from "../entities/Stock";

export class ArticleController {
  private articleRepository = AppDataSource.getRepository(Article);
  private familleRepository = AppDataSource.getRepository(Famille);
  private stockRepository = AppDataSource.getRepository(Stock);

  async obtenirTousLesArticles(request: Request, response: Response) {
    try {
      const articles = await this.articleRepository.find({
        relations: ["famille", "sousfamille"],
      });

      // Mettre à jour la quantité pour chaque article
      for (let article of articles) {
        const totalStock = await this.stockRepository
          .createQueryBuilder("stock")
          .select("SUM(stock.entree) - SUM(stock.sortie)", "total")
          .where("stock.articles_id = :id", { id: article.id })
          .getRawOne();

        article.quantite = parseFloat(totalStock.total) || 0;
      }

      await this.articleRepository.save(articles);

      response.json(articles);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      response.status(500).json({
        message: "Erreur lors de la récupération des articles",
        error,
      });
    }
  }

  async mettreAJourQuantiteArticle(articleId: number): Promise<void> {
    const totalStock = await this.stockRepository
      .createQueryBuilder("stock")
      .select("SUM(stock.entree) - SUM(stock.sortie)", "total")
      .where("stock.articles_id = :id", { id: articleId })
      .getRawOne();

    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });
    if (article) {
      article.quantite = parseFloat(totalStock.total) || 0;
      await this.articleRepository.save(article);
    }
  }

  async obtenirArticleParId(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const article = await this.articleRepository.findOne({
        where: { id },
        relations: ["famille"],
      });
      if (article) {
        response.json(article);
      } else {
        response.status(404).json({ message: "Article non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'article:", error);
      response.status(500).json({
        message: "Erreur lors de la récupération de l'article",
        error,
      });
    }
  }

  async verifierStockBas(request: Request, response: Response) {
    try {
      const articlesStockBas = await this.articleRepository
        .createQueryBuilder("article")
        .where("article.quantite <= :seuil", { seuil: 2 })
        .getMany();
      response.json(articlesStockBas);
    } catch (error) {
      console.error("Erreur lors de la vérification du stock bas:", error);
      response.status(500).json({
        message: "Erreur lors de la vérification du stock bas",
        error,
      });
    }
  }

  async createArticle(request: Request, response: Response) {
    try {
      const {
        designation,
        type,
        prix_achat,
        prix_ht,
        marge_pourcent,
        marge_num,
        prix_ttc,
        complet,
        famille_id,
        sousfamille_id
      } = request.body;

      const famille = await this.familleRepository.findOne({
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

      const savedArticle = await this.articleRepository.save(article);
    
      // Fetch the complete article with relations
      const completeArticle = await this.articleRepository.findOne({
        where: { id: savedArticle.id },
        relations: ["famille", "sousfamille"]
      });

      return response.status(201).json(completeArticle);
    } catch (error) {
      console.error("Erreur lors de la création de l'article:", error);
      return response.status(500).json({ message: "Erreur lors de la création de l'article", error });
    }
  }  
  
  async updateArticle(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      const article = await this.articleRepository.findOne({ where: { id } });
      if (!article) {
        return response.status(404).json({ message: "Article non trouvé" });
      }

      const updatedArticle = Object.assign(article, request.body);
      await this.articleRepository.save(updatedArticle);
      return response.json({ message: "Article mis à jour", article: updatedArticle });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la mise à jour de l'article", error });
    }
  }
  async deleteArticle(request: Request, response: Response): Promise<Response> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);

      // Fetch article with relations
      const article = await queryRunner.manager.findOne(Article, {
        where: { id },
        relations: ["stocks"],
      });

      if (!article) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Article non trouvé" });
      }

      // Delete related facture_achat_detail records
      await queryRunner.query(
        `DELETE FROM facture_achat_detail WHERE article_id = $1`,
        [id]
      );

      // Delete related stock records
      await queryRunner.query(`DELETE FROM stocks WHERE articles_id = $1`, [
        id,
      ]);

      // Delete the article
      await queryRunner.manager.remove(Article, article);

      await queryRunner.commitTransaction();
      return response.json({
        message: "Article et données associées supprimés avec succès",
        success: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la suppression de l'article:", error);
      return response.status(500).json({
        message: "Erreur lors de la suppression de l'article",
        error,
        success: false,
      });
    } finally {
      await queryRunner.release();
    }
  }}
