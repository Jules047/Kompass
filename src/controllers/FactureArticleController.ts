import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { FactureArticle } from "../entities/FactureArticle";
import { Client } from "../entities/Client";
import { Article } from "../entities/Article";
import { MoyenPaiement } from "../entities/MoyenPaiement";
import { FactureArticleDetail } from "../entities/FactureArticleDetail";
import PDFDocument from "pdfkit";
import path from "path";

export class FactureArticleController {
  private factureArticleRepository =
    AppDataSource.getRepository(FactureArticle);
  private clientRepository = AppDataSource.getRepository(Client);
  private articleRepository = AppDataSource.getRepository(Article);
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);
  private factureArticleDetailRepository =
    AppDataSource.getRepository(FactureArticleDetail);

  async createFactureArticle(request: Request, response: Response) {
    try {
      const {
        clients_id,
        articles,
        moyens_paiement_id,
        montant_regle,
        ...factureData
      } = request.body;

      const client = await this.clientRepository.findOne({
        where: { id: clients_id },
      });
      const moyenPaiement = await this.moyenPaiementRepository.findOne({
        where: { id: moyens_paiement_id },
      });

      if (!client || !moyenPaiement) {
        return response.status(404).json({
          message: "Client ou Moyen de paiement non trouvé",
        });
      }

      let montantInitial = 0;
      let factureArticleDetails: FactureArticleDetail[] = [];

      if (Array.isArray(articles)) {
        for (let articleData of articles) {
          const article = await this.articleRepository.findOne({
            where: { id: articleData.id },
          });

          if (!article) {
            return response.status(404).json({
              message: `Article avec l'ID ${articleData.id} non trouvé`,
            });
          }

          const articleMontant =
            Number(article.prix_ttc) * Number(articleData.quantite);
          montantInitial += articleMontant;

          const factureArticleDetail = new FactureArticleDetail();
          factureArticleDetail.article = article;
          factureArticleDetail.quantite = articleData.quantite;
          factureArticleDetails.push(factureArticleDetail);
        }
      } else {
        return response.status(400).json({
          message: "Les articles doivent être fournis sous forme de tableau",
        });
      }

      const montantRegleValue = Number(montant_regle) || 0;
      const solde_du = Math.max(0, montantInitial - montantRegleValue);

      const nouvelleFacture = new FactureArticle();
      Object.assign(nouvelleFacture, {
        ...factureData,
        clients_id,
        moyens_paiement_id,
        montant_initial: montantInitial,
        montant_regle: montantRegleValue,
        solde_du,
        client,
        factureArticleDetails,
        moyenPaiement,
      });

      const factureSauvegardee = await this.factureArticleRepository.save(
        nouvelleFacture
      );

      const factureComplete = await this.factureArticleRepository.findOne({
        where: { id: factureSauvegardee.id },
        relations: [
          "client",
          "factureArticleDetails",
          "factureArticleDetails.article",
          "moyenPaiement",
        ],
      });

      if (factureComplete) {
        response.json({
          message: "Facture article créée",
          facture: factureComplete,
        });
      } else {
        response.status(404).json({
          message:
            "Facture article créée mais non trouvée lors de la récupération",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création de la facture article:", error);
      response.status(500).json({
        message: "Erreur lors de la création de la facture article",
        error,
      });
    }
  }

  async getAllFacturesArticle(request: Request, response: Response) {
    try {
      const facturesArticle = await this.factureArticleRepository.find({
        relations: [
          "client",
          "factureArticleDetails",
          "factureArticleDetails.article",
          "moyenPaiement",
        ],
      });
      response.json(facturesArticle);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des factures article:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération des factures article",
        error,
      });
    }
  }

  async getFactureArticleById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const factureArticle = await this.factureArticleRepository.findOne({
        where: { id },
        relations: [
          "client",
          "factureArticleDetails",
          "factureArticleDetails.article",
          "moyenPaiement",
        ],
      });
      if (factureArticle) {
        response.json(factureArticle);
      } else {
        response.status(404).json({ message: "Facture article non trouvée" });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la facture article:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération de la facture article",
        error,
      });
    }
  }

  // async updateFactureArticle(request: Request, response: Response) {
  //   try {
  //     const id = parseInt(request.params.id);
  //     const factureArticle = await this.factureArticleRepository.findOne({
  //       where: { id },
  //       relations: ["factureArticleDetails", "factureArticleDetails.article"],
  //     });
  //     if (!factureArticle) {
  //       return response
  //         .status(404)
  //         .json({ message: "Facture article non trouvée" });
  //     }

  //     const { montant_initial, montant_regle, articles, ...updateData } =
  //       request.body;

  //     let newMontantInitial = factureArticle.montant_initial;
  //     let newFactureArticleDetails: FactureArticleDetail[] = [
  //       ...factureArticle.factureArticleDetails,
  //     ];

  //     if (articles) {
  //       newMontantInitial = 0;
  //       newFactureArticleDetails = [];

  //       for (let articleData of articles) {
  //         const article = await this.articleRepository.findOne({
  //           where: { id: articleData.id },
  //         });

  //         if (!article) {
  //           return response.status(404).json({
  //             message: `Article avec l'ID ${articleData.id} non trouvé`,
  //           });
  //         }

  //         const articleMontant =
  //           Number(article.prix_ttc) * Number(articleData.quantite);
  //         newMontantInitial += articleMontant;

  //         const factureArticleDetail = new FactureArticleDetail();
  //         factureArticleDetail.article = article;
  //         factureArticleDetail.quantite = articleData.quantite;
  //         newFactureArticleDetails.push(factureArticleDetail);
  //       }
  //     }

  //     const newMontantRegle =
  //       montant_regle !== undefined
  //         ? parseFloat(montant_regle)
  //         : factureArticle.montant_regle;
  //     const newSoldeDu = Math.max(0, newMontantInitial - newMontantRegle);

  //     const updatedFactureArticle = Object.assign(factureArticle, {
  //       ...updateData,
  //       montant_initial: newMontantInitial,
  //       montant_regle: newMontantRegle,
  //       solde_du: newSoldeDu,
  //       factureArticleDetails: newFactureArticleDetails,
  //     });

  //     await this.factureArticleRepository.save(updatedFactureArticle);

  //     const updatedFactureComplete =
  //       await this.factureArticleRepository.findOne({
  //         where: { id },
  //         relations: [
  //           "client",
  //           "factureArticleDetails",
  //           "factureArticleDetails.article",
  //           "moyenPaiement",
  //         ],
  //       });

  //     response.json({
  //       message: "Facture article mise à jour",
  //       factureArticle: updatedFactureComplete,
  //     });
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la mise à jour de la facture article:",
  //       error
  //     );
  //     response.status(500).json({
  //       message: "Erreur lors de la mise à jour de la facture article",
  //       error,
  //     });
  //   }
  // }

  async updateFactureArticle(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const factureArticle = await this.factureArticleRepository.findOne({
        where: { id },
        relations: ["factureArticleDetails"],
      });

      if (!factureArticle) {
        return response
          .status(404)
          .json({ message: "Facture article non trouvée" });
      }

      const { articles, ...updateData } = request.body;

      // Remove existing FactureArticleDetail entities
      if (factureArticle.factureArticleDetails) {
        await this.factureArticleDetailRepository.remove(
          factureArticle.factureArticleDetails
        );
      }

      // Create new FactureArticleDetail entities
      const newFactureArticleDetails: FactureArticleDetail[] = [];
      let totalMontant = 0;

      for (const articleData of articles) {
        const article = await this.articleRepository.findOne({
          where: { id: articleData.id },
        });
        if (!article) {
          return response.status(404).json({
            message: `Article avec l'ID ${articleData.id} non trouvé`,
          });
        }

        const detail = new FactureArticleDetail();
        detail.article = article;
        detail.quantite = articleData.quantite;
        detail.factureArticle = factureArticle;
        newFactureArticleDetails.push(detail);

        totalMontant += article.prix_ttc * articleData.quantite;
      }

      // Update FactureArticle
      Object.assign(factureArticle, {
        ...updateData,
        montant_initial: totalMontant,
        solde_du: totalMontant - (updateData.montant_regle || 0),
        factureArticleDetails: newFactureArticleDetails,
      });

      await this.factureArticleRepository.save(factureArticle);

      const updatedFactureArticle = await this.factureArticleRepository.findOne(
        {
          where: { id },
          relations: [
            "client",
            "factureArticleDetails",
            "factureArticleDetails.article",
            "moyenPaiement",
          ],
        }
      );

      response.json({
        message: "Facture article mise à jour",
        factureArticle: updatedFactureArticle,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la facture article:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la mise à jour de la facture article",
        error,
      });
    }
  }
  async deleteFactureArticle(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const factureArticle = await this.factureArticleRepository.findOne({
        where: { id },
        relations: ["factureArticleDetails"],
      });
      if (!factureArticle) {
        return response
          .status(404)
          .json({ message: "Facture article non trouvée" });
      }
      await this.factureArticleRepository.remove(factureArticle);
      response.json({ message: "Facture article supprimée" });
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la facture article:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la suppression de la facture article",
        error,
      });
    }
  }

  async generatePDF(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const factureArticle = await this.factureArticleRepository.findOne({
        where: { id },
        relations: [
          "client",
          "factureArticleDetails",
          "factureArticleDetails.article",
          "moyenPaiement",
        ],
      });

      if (!factureArticle) {
        return response
          .status(404)
          .json({ message: "Facture article non trouvée" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `FCT${String(factureArticle.id).padStart(4, "0")}.pdf`;

      response.setHeader(
        "Content-disposition",
        'attachment; filename="' + filename + '"'
      );
      response.setHeader("Content-type", "application/pdf");

      doc.pipe(response);

      // Add company logo
      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "src",
        "assets",
        "depannpc.png"
      );
      doc.image(imagePath, { fit: [60, 100] });

      doc.moveDown();

      // Header
      doc.fontSize(25).text("Facture", { align: "center" });
      doc.moveDown();

      // Facture information (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: FCT${String(factureArticle.id).padStart(4, "0")}`);
      doc.text(`Date: ${new Date(factureArticle.date).toLocaleDateString()}`);
      doc.moveDown();
      doc.text(`Moyen de paiement: ${factureArticle.moyenPaiement.moyen}`);
      doc.text(`Commentaire: ${factureArticle.commentaire}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(
        `Client: ${factureArticle.client.nom} ${factureArticle.client.prenom}`,
        400,
        startY
      );
      doc.text(`Adresse: ${factureArticle.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${factureArticle.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${factureArticle.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${factureArticle.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${factureArticle.client.email}`, 400, doc.y);

      doc.moveDown();

      // Articles table
      const tableTop = 241;
      const tableLeft = 50;
      const rowHeight = 30;

      doc.font("Helvetica-Bold");
      doc.text("Désignation", tableLeft, tableTop);
      doc.text("Quantité", tableLeft + 250, tableTop);
      doc.text("Prix TTC", tableLeft + 350, tableTop);

      doc.font("Helvetica");
      let yPosition = tableTop + rowHeight;

      factureArticle.factureArticleDetails.forEach((detail) => {
        const article = detail.article;
        doc.text(article.designation, tableLeft, yPosition);
        doc.text(detail.quantite.toString(), tableLeft + 250, yPosition);
        doc.text(
          Number(article.prix_ttc).toFixed(2) + " €",
          tableLeft + 350,
          yPosition
        );
        yPosition += rowHeight;
      });

      // Total, Montant réglé and Solde dû
      const bottomOfQuantityColumn = yPosition;
      doc.y = bottomOfQuantityColumn;

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(
        `Total TTC: ${factureArticle.montant_initial.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        { align: "left" }
      );
      doc.moveDown();
      doc.text(
        `Montant réglé: ${factureArticle.montant_regle.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        { align: "left" }
      );
      doc.moveDown();
      doc.text(
        `Solde dû: ${factureArticle.solde_du.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        { align: "left" }
      );

      doc.end();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la génération du PDF", error });
    }
  }
}