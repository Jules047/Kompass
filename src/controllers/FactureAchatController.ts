import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { FactureAchat } from "../entities/FactureAchat";
import { Fournisseur } from "../entities/Fournisseur";
import { Article } from "../entities/Article";
import { MoyenPaiement } from "../entities/MoyenPaiement";
import { FactureAchatDetail } from "../entities/FactureAchatDetail";
import PDFDocument from "pdfkit";
import { StockController } from "./StockController";
import path from "path";

export class FactureAchatController {
  private factureAchatRepository = AppDataSource.getRepository(FactureAchat);
  private fournisseurRepository = AppDataSource.getRepository(Fournisseur);
  private articleRepository = AppDataSource.getRepository(Article);
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);
  private stockController = new StockController();

  async getFactureAchatById(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const factureAchat = await this.factureAchatRepository.findOne({
        where: { id },
        relations: [
          "fournisseur",
          "moyenPaiement",
          "factureAchatDetails",
          "factureAchatDetails.article",
        ],
      });

      if (!factureAchat) {
        res.status(404).json({ message: "Facture d'achat non trouvée" });
        return;
      }

      res.json(factureAchat);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Erreur lors de la récupération de la facture d'achat",
      });
    }
  }

  async getAllFacturesAchat(req: Request, res: Response): Promise<void> {
    try {
      const facturesAchat = await this.factureAchatRepository.find({
        relations: [
          "fournisseur",
          "moyenPaiement",
          "factureAchatDetails",
          "factureAchatDetails.article",
        ],
      });
      res.json(facturesAchat);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Erreur lors de la récupération des factures d'achat",
      });
    }
  }

  async createFactureAchat(request: Request, response: Response): Promise<void> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const {
        fournisseurs_id,
        articles,
        moyens_paiement_id,
        montant_regle,
        ...factureData
      } = request.body;

      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id: fournisseurs_id },
      });
      const moyenPaiement = await this.moyenPaiementRepository.findOne({
        where: { id: moyens_paiement_id },
      });

      if (!fournisseur || !moyenPaiement) {
        response.status(404).json({
          message: "Fournisseur ou Moyen de paiement non trouvé",
        });
        return;
      }

      let montantInitial = 0;
      let factureAchatDetails: FactureAchatDetail[] = [];

      if (Array.isArray(articles)) {
        for (let articleData of articles) {
          const article = await this.articleRepository.findOne({
            where: { id: articleData.id },
          });

          if (!article) {
            response.status(404).json({
              message: `Article avec l'ID ${articleData.id} non trouvé`,
            });
            return;
          }

          const articleMontant =
            Number(article.prix_ttc) * Number(articleData.quantite);
          montantInitial += articleMontant;

          const factureAchatDetail = new FactureAchatDetail();
          factureAchatDetail.article = article;
          factureAchatDetail.quantite = articleData.quantite;
          factureAchatDetails.push(factureAchatDetail);
        }
      } else {
        response.status(400).json({
          message: "Les articles doivent être fournis sous forme de tableau",
        });
        return;
      }

      const montantRegleValue = Number(montant_regle) || 0;
      const solde_du = Math.max(0, montantInitial - montantRegleValue);

      const nouvelleFacture = new FactureAchat();
      Object.assign(nouvelleFacture, {
        ...factureData,
        fournisseurs_id,
        moyens_paiement_id,
        prix_total: montantInitial,
        montant_regle: montantRegleValue,
        solde_du,
        fournisseur,
        factureAchatDetails,
        moyenPaiement,
      });

      const factureSauvegardee = await queryRunner.manager.save(
        nouvelleFacture
      );

      await this.stockController.updateStockFromFactureAchat(
        queryRunner,
        factureSauvegardee
      );

      // Mise à jour du solde_total du fournisseur
      await queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
        fournisseurs_id,
      ]);

      await queryRunner.commitTransaction();

      const factureComplete = await this.factureAchatRepository.findOne({
        where: { id: factureSauvegardee.id },
        relations: [
          "fournisseur",
          "factureAchatDetails",
          "factureAchatDetails.article",
          "moyenPaiement",
        ],
      });

      if (factureComplete) {
        response.json({
          message: "Facture achat créée",
          facture: factureComplete,
        });
      } else {
        response.status(404).json({
          message:
            "Facture achat créée mais non trouvée lors de la récupération",
        });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la création de la facture achat:", error);
      response.status(500).json({
        message: "Erreur lors de la création de la facture achat",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async updateFactureAchat(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);
      const {
        articles,
        montant_regle,
        commentaire,
        date,
        moyens_paiement_id,
        fournisseurs_id,
      } = request.body;

      const factureAchat = await queryRunner.manager.findOne(FactureAchat, {
        where: { id },
        relations: [
          "factureAchatDetails",
          "factureAchatDetails.article",
          "fournisseur",
          "moyenPaiement",
        ],
      });

      if (!factureAchat) {
        throw new Error(`Facture achat with id ${id} not found`);
      }

      const oldFournisseurId = factureAchat.fournisseur.id;

      if (fournisseurs_id) {
        const newFournisseur = await queryRunner.manager.findOne(Fournisseur, {
          where: { id: fournisseurs_id },
        });
        if (!newFournisseur) {
          throw new Error(`Fournisseur with id ${fournisseurs_id} not found`);
        }
        factureAchat.fournisseur = newFournisseur;
      }

      if (moyens_paiement_id) {
        const newMoyenPaiement = await queryRunner.manager.findOne(
          MoyenPaiement,
          { where: { id: moyens_paiement_id } }
        );
        if (!newMoyenPaiement) {
          throw new Error(
            `Moyen de paiement with id ${moyens_paiement_id} not found`
          );
        }
        factureAchat.moyenPaiement = newMoyenPaiement;
      }

      factureAchat.date = new Date(date);
      factureAchat.commentaire = commentaire;
      factureAchat.montant_regle = parseFloat(montant_regle);

      if (Array.isArray(articles)) {
        await queryRunner.manager.remove(
          FactureAchatDetail,
          factureAchat.factureAchatDetails
        );

        let newPrixTotal = 0;
        const newFactureAchatDetails: FactureAchatDetail[] = [];

        for (const articleData of articles) {
          const article = await queryRunner.manager.findOne(Article, {
            where: { id: articleData.id },
          });
          if (!article) {
            throw new Error(`Article with id ${articleData.id} not found`);
          }

          const detail = new FactureAchatDetail();
          detail.article = article;
          detail.quantite = articleData.quantite;
          detail.factureAchat = factureAchat;
          newFactureAchatDetails.push(detail);

          newPrixTotal += article.prix_ttc * articleData.quantite;
        }

        factureAchat.factureAchatDetails = newFactureAchatDetails;
        factureAchat.prix_total = newPrixTotal;
        factureAchat.solde_du = Math.max(
          0,
          newPrixTotal - factureAchat.montant_regle
        );
      }

      const updatedFacture = await queryRunner.manager.save(
        FactureAchat,
        factureAchat
      );

      await this.stockController.updateStockFromFactureAchat(
        queryRunner,
        updatedFacture
      );

      // Mise à jour du solde_total pour l'ancien et le nouveau fournisseur si nécessaire
      await queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
        oldFournisseurId,
      ]);
      if (fournisseurs_id && fournisseurs_id !== oldFournisseurId) {
        await queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
          fournisseurs_id,
        ]);
      }

      await queryRunner.commitTransaction();

      response.json({
        message: "Facture d'achat mise à jour avec succès🥰",
        factureAchat: sanitizeFactureAchat(updatedFacture),
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating facture achat:", error);
      response.status(500).json({
        message: "Erreur lors de la mise à jour de la facture d'achat",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await queryRunner.release();
    }
  }

  async deleteFactureAchat(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);
      const factureAchat = await this.factureAchatRepository.findOne({
        where: { id },
        relations: ["stocks", "factureAchatDetails"],
      });

      if (factureAchat) {
        // Delete associated stocks first
        if (factureAchat.stocks) {
          await queryRunner.manager.remove(factureAchat.stocks);
        }

        // Delete the facture and its details
        await queryRunner.manager.remove(factureAchat);
        await queryRunner.commitTransaction();

        response.json({ message: "Facture d'achat supprimée avec succès" });
      } else {
        response.status(404).json({ message: "Facture d'achat non trouvée" });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(
        "Erreur lors de la suppression de la facture d'achat:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la suppression de la facture d'achat",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async generatePDF(request: Request, response: Response): Promise<void> {
    try {
      const id = parseInt(request.params.id);
      const factureAchat = await this.factureAchatRepository.findOne({
        where: { id },
        relations: [
          "fournisseur",
          "factureAchatDetails",
          "factureAchatDetails.article",
          "moyenPaiement",
        ],
      });

      if (!factureAchat) {
        response
          .status(404)
          .json({ message: "Facture achat non trouvée" });
        return;
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `FACA${String(factureAchat.id).padStart(4, "0")}.pdf`;

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
      doc.fontSize(25).text("Facture d'Achat", { align: "center" });
      doc.moveDown();

      // Facture information (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: FACA${String(factureAchat.id).padStart(4, "0")}`);
      doc.text(`Date: ${new Date(factureAchat.date).toLocaleDateString()}`);
      doc.moveDown();
      doc.text(`Moyen de paiement: ${factureAchat.moyenPaiement.moyen}`);
      doc.text(`Commentaire: ${factureAchat.commentaire}`);

      // Fournisseur information (right side)
      doc.fontSize(12);
      doc.text(`Fournisseur: ${factureAchat.fournisseur.societe}`, 400, startY);
      doc.text(`Adresse: ${factureAchat.fournisseur.adresse}`, 400, doc.y);
      doc.text(
        `Code Postal: ${factureAchat.fournisseur.code_postal}`,
        400,
        doc.y
      );
      doc.text(`Ville: ${factureAchat.fournisseur.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${factureAchat.fournisseur.telephone}`, 400, doc.y);
      doc.text(`Email: ${factureAchat.fournisseur.email}`, 400, doc.y);

      doc.moveDown();

      // Articles table
      const tableTop = 220;
      const tableLeft = 50;
      const rowHeight = 30;

      doc.font("Helvetica-Bold");
      doc.text("Désignation", tableLeft, tableTop);
      doc.text("Quantité", tableLeft + 250, tableTop);
      doc.text("Prix TTC", tableLeft + 350, tableTop);

      doc.font("Helvetica");
      let yPosition = tableTop + rowHeight;

      factureAchat.factureAchatDetails.forEach((detail) => {
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
        `Total TTC: ${factureAchat.prix_total.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        { align: "left" }
      );
      doc.moveDown();
      doc.text(
        `Montant réglé: ${factureAchat.montant_regle.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        { align: "left" }
      );
      doc.moveDown();
      doc.text(
        `Solde dû: ${factureAchat.solde_du.toFixed(2)} €`,
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
  }}

function sanitizeFactureAchat(facture: FactureAchat) {
  const { factureAchatDetails, ...sanitizedFacture } = facture;
  return {
    ...sanitizedFacture,
    factureAchatDetails: factureAchatDetails.map((detail) => ({
      id: detail.id,
      quantite: detail.quantite,
      article: detail.article,
    })),
  };
}

export const factureAchatController = new FactureAchatController();
