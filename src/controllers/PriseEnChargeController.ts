import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { PriseEnCharge } from "../entities/PriseEnCharge";
import { Client } from "../entities/Client";
import { Article } from "../entities/Article";
import { Machine } from "../entities/Machine";
import { Vendeur } from "../entities/Vendeur";
import { PriseEnChargeArticle } from "../entities/PriseEnChargeArticle";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.join(__dirname, "..", "..", "uploads", "signatures");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `signature_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

export class PriseEnChargeController {
  private priseEnChargeRepository = AppDataSource.getRepository(PriseEnCharge);
  private clientRepository = AppDataSource.getRepository(Client);
  private articleRepository = AppDataSource.getRepository(Article);
  private machineRepository = AppDataSource.getRepository(Machine);
  private vendeurRepository = AppDataSource.getRepository(Vendeur);

  async createPriseEnCharge(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    let transactionStarted = false;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      transactionStarted = true;

      const {
        clients_id,
        articles,
        machines_id,
        vendeurs_id,
        ...priseEnChargeData
      } = request.body;

      const client = await queryRunner.manager.findOne(Client, {
        where: { id: clients_id },
      });
      const machine = await queryRunner.manager.findOne(Machine, {
        where: { id: machines_id },
      });
      const vendeur = await queryRunner.manager.findOne(Vendeur, {
        where: { id: vendeurs_id },
      });

      if (!client || !machine || !vendeur) {
        throw new Error("Client, Machine ou Vendeur non trouvé");
      }

      const nouvellePriseEnCharge = new PriseEnCharge();
      Object.assign(nouvellePriseEnCharge, {
        ...priseEnChargeData,
        client,
        machine,
        vendeur,
        date: new Date(),
      });

      const priseEnChargeSauvegardee = await queryRunner.manager.save(
        PriseEnCharge,
        nouvellePriseEnCharge
      );

      if (Array.isArray(articles)) {
        for (let articleData of articles) {
          const article = await queryRunner.manager.findOne(Article, {
            where: { id: articleData.id },
          });

          if (!article) {
            throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
          }

          const priseEnChargeArticle = new PriseEnChargeArticle();
          priseEnChargeArticle.article = article;
          priseEnChargeArticle.quantite = articleData.quantite;
          priseEnChargeArticle.priseEnCharge = priseEnChargeSauvegardee;
          await queryRunner.manager.save(
            PriseEnChargeArticle,
            priseEnChargeArticle
          );
        }
      }

      await queryRunner.commitTransaction();

      const priseEnChargeComplete = await this.priseEnChargeRepository.findOne({
        where: { id: priseEnChargeSauvegardee.id },
        relations: [
          "client",
          "priseEnChargeArticles",
          "priseEnChargeArticles.article",
          "machine",
          "vendeur",
        ],
      });

      if (priseEnChargeComplete) {
        response.json({
          message: "Prise en charge créée",
          priseEnCharge: priseEnChargeComplete,
        });
      } else {
        throw new Error(
          "Prise en charge créée mais non trouvée lors de la récupération"
        );
      }
    } catch (error) {
      console.error("Erreur lors de la création de la prise en charge:", error);
      if (transactionStarted && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      response.status(500).json({
        message: "Erreur lors de la création de la prise en charge",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await queryRunner.release();
    }
  }

  async getAllPrisesEnCharge(request: Request, response: Response) {
    try {
      const prisesEnCharge = await this.priseEnChargeRepository
        .createQueryBuilder("priseEnCharge")
        .leftJoinAndSelect("priseEnCharge.client", "client")
        .leftJoinAndSelect(
          "priseEnCharge.priseEnChargeArticles",
          "priseEnChargeArticles"
        )
        .leftJoinAndSelect("priseEnChargeArticles.article", "article")
        .leftJoinAndSelect("priseEnCharge.machine", "machine")
        .leftJoinAndSelect("priseEnCharge.vendeur", "vendeur")
        .orderBy("priseEnCharge.date", "DESC")
        .getMany();

      const formattedPrisesEnCharge = prisesEnCharge.map((pec) => ({
        ...pec,
        formattedId: `PEC${pec.id.toString().padStart(4, "0")}`,
      }));

      response.json(formattedPrisesEnCharge);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des prises en charge:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération des prises en charge",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async getPriseEnChargeById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const priseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id },
        relations: [
          "client",
          "priseEnChargeArticles",
          "priseEnChargeArticles.article",
          "machine",
          "vendeur",
        ],
      });
      if (priseEnCharge) {
        response.json(priseEnCharge);
      } else {
        response.status(404).json({ message: "Prise en charge non trouvée" });
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la prise en charge:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération de la prise en charge",
        error,
      });
    }
  }

  async updatePriseEnCharge(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    let transactionStarted = false;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      transactionStarted = true;
      const id = parseInt(request.params.id);
      const { articles, ...priseEnChargeData } = request.body;

      let priseEnCharge = await queryRunner.manager.findOne(PriseEnCharge, {
        where: { id },
        relations: [
          "priseEnChargeArticles",
          "priseEnChargeArticles.article",
          "client",
          "machine",
          "vendeur",
        ],
      });

      if (!priseEnCharge) {
        throw new Error(`Prise en charge with id ${id} not found`);
      }

      // Update other fields
      Object.assign(priseEnCharge, priseEnChargeData);

      // Save updated prise en charge first
      priseEnCharge = await queryRunner.manager.save(
        PriseEnCharge,
        priseEnCharge
      );

      // Update articles
      if (Array.isArray(articles)) {
        // Remove existing PriseEnChargeArticles
        await queryRunner.manager.delete(PriseEnChargeArticle, {
          prise_en_charge_id: priseEnCharge.id,
        });

        // Create new PriseEnChargeArticles
        for (const articleData of articles) {
          const article = await queryRunner.manager.findOne(Article, {
            where: { id: articleData.id },
          });
          if (!article) {
            throw new Error(`Article with id ${articleData.id} not found`);
          }

          const newPriseEnChargeArticle = new PriseEnChargeArticle();
          newPriseEnChargeArticle.article = article;
          newPriseEnChargeArticle.article_id = article.id;
          newPriseEnChargeArticle.quantite = articleData.quantite;
          newPriseEnChargeArticle.priseEnCharge = priseEnCharge;
          newPriseEnChargeArticle.prise_en_charge_id = priseEnCharge.id;
          await queryRunner.manager.save(
            PriseEnChargeArticle,
            newPriseEnChargeArticle
          );
        }
      }

      await queryRunner.commitTransaction();

      const updatedPriseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id },
        relations: [
          "client",
          "priseEnChargeArticles",
          "priseEnChargeArticles.article",
          "machine",
          "vendeur",
        ],
      });

      response.json({
        message: "Prise en charge mise à jour avec succès🥰",
        priseEnCharge: updatedPriseEnCharge,
      });
    } catch (error) {
      console.error("Error updating prise en charge:", error);
      if (transactionStarted && queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      response.status(500).json({
        message: "Erreur lors de la mise à jour de la prise en charge",
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await queryRunner.release();
    }
  }

  async deletePriseEnCharge(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const priseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id },
        relations: ["priseEnChargeArticles"],
      });
      if (!priseEnCharge) {
        return response
          .status(404)
          .json({ message: "Prise en charge non trouvée" });
      }
      await this.priseEnChargeRepository.remove(priseEnCharge);
      response.json({ message: "Prise en charge supprimée" });
    } catch (error) {
      console.error(
        "Erreur lors de la suppression de la prise en charge:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la suppression de la prise en charge",
        error,
      });
    }
  }

  async uploadSignature(request: Request, response: Response) {
    upload.single("signature")(request, response, async (err) => {
      if (err) {
        return response.status(400).json({
          message: "Erreur lors de l'upload de la signature",
          error: err,
        });
      }

      const id = parseInt(request.params.id);
      const priseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id },
      });

      if (!priseEnCharge) {
        return response
          .status(404)
          .json({ message: "Prise en charge non trouvée" });
      }

      if (
        priseEnCharge.signature_path &&
        fs.existsSync(priseEnCharge.signature_path)
      ) {
        fs.unlinkSync(priseEnCharge.signature_path);
      }

      if (request.file) {
        priseEnCharge.signature_path = request.file.path;
        await this.priseEnChargeRepository.save(priseEnCharge);
        response.json({
          message: "Signature uploadée avec succès🥰",
          priseEnCharge,
        });
      } else {
        response.status(400).json({ message: "Aucun fichier n'a été uploadé" });
      }
    });
  }

  async generatePDF(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const priseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id },
        relations: [
          "client",
          "priseEnChargeArticles",
          "priseEnChargeArticles.article",
          "machine",
          "vendeur",
        ],
      });

      if (!priseEnCharge) {
        return response
          .status(404)
          .json({ message: "Prise en charge non trouvée" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `PEC${String(priseEnCharge.id).padStart(4, "0")}.pdf`;

      response.setHeader(
        "Content-disposition",
        'attachment; filename="' + filename + '"'
      );
      response.setHeader("Content-type", "application/pdf");

      doc.pipe(response);

      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "src",
        "assets",
        "depannpc.png"
      );
      doc.image(imagePath, {
        fit: [60, 100],
      });

      doc.moveDown();

      // En-tête
      doc.fontSize(25).text("Prise en Charge", { align: "center" });
      doc.moveDown();
      // Informations de la prise en charge (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: PEC${String(priseEnCharge.id).padStart(4, "0")}`);
      doc.text(`Date: ${new Date(priseEnCharge.date).toLocaleDateString()}`);
      doc.text(
        `Statut: ${
          priseEnCharge.statut === "Pret" ? "Prêt" : priseEnCharge.statut
        }`
      );
      doc.moveDown();
      doc.text(
        `Machine: ${priseEnCharge.machine.label} ${priseEnCharge.machine.marque} (${priseEnCharge.machine.couleur})`
      );
      doc.text(
        `Vendeur: ${priseEnCharge.vendeur.nom} ${priseEnCharge.vendeur.prenom}`
      );
      doc.moveDown();
      doc.text(`Symptôme: ${priseEnCharge.symptome}`);
      doc.text(
        `Mot de passe Windows: ${
          priseEnCharge.mot_de_passe_windows || "Non fourni"
        }`
      );
      doc.text(`Batterie: ${priseEnCharge.batterie || "Non spécifié"}`);
      doc.text(`Chargeur: ${priseEnCharge.chargeur || "Non spécifié"}`);
      doc.text(`Accessoire: ${priseEnCharge.accessoire || "Pas d'accessoire"}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(
        `Client: ${priseEnCharge.client.nom} ${priseEnCharge.client.prenom}`,
        400,
        startY
      );
      doc.text(`Adresse: ${priseEnCharge.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${priseEnCharge.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${priseEnCharge.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${priseEnCharge.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${priseEnCharge.client.email}`, 400, doc.y);

      doc.moveDown();
      // Tableau des articles
      const tableTop = 350;
      const tableLeft = 50;
      const rowHeight = 30;

      doc.font("Helvetica-Bold");
      doc.text("Désignation", tableLeft, tableTop);
      doc.text("Quantité", tableLeft + 250, tableTop);
      doc.text("Prix TTC", tableLeft + 350, tableTop);

      doc.font("Helvetica");
      let yPosition = tableTop + rowHeight;

      priseEnCharge.priseEnChargeArticles.forEach((detail) => {
        const article = detail.article;
        doc.text(article.designation, tableLeft, yPosition);
        doc.text(detail.quantite.toString(), tableLeft + 250, yPosition);
        const prix_ttc =
          typeof article.prix_ttc === "number"
            ? article.prix_ttc
            : parseFloat(article.prix_ttc);
        doc.text(
          (isNaN(prix_ttc) ? 0 : prix_ttc).toFixed(2) + " €",
          tableLeft + 350,
          yPosition
        );
        yPosition += rowHeight;
      });

      // Calcul du total
      const total = priseEnCharge.priseEnChargeArticles.reduce(
        (acc, detail) => {
          const prix_ttc =
            typeof detail.article.prix_ttc === "number"
              ? detail.article.prix_ttc
              : parseFloat(detail.article.prix_ttc);
          return acc + prix_ttc * detail.quantite;
        },
        0
      );

      // After adding the articles to the PDF
      const bottomOfQuantityColumn = yPosition;

      // Move to the bottom of the "Quantité" column
      doc.y = bottomOfQuantityColumn;

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(`Total: ${total.toFixed(2)} €`, tableLeft + 315, doc.y, {
        align: "left",
      });

      // Signature
      if (
        priseEnCharge.signature_path &&
        fs.existsSync(priseEnCharge.signature_path)
      ) {
        const signatureImageSize = 100;
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const margin = 50;

        doc.text(
          "Signature:",
          pageWidth - signatureImageSize - margin,
          pageHeight - signatureImageSize - margin - 20
        );
        doc.image(
          priseEnCharge.signature_path,
          pageWidth - signatureImageSize - margin,
          pageHeight - signatureImageSize - margin,
          {
            fit: [signatureImageSize, signatureImageSize],
          }
        );
      } else {
        doc.text("Signature: Non signé", {
          align: "right",
        });
      }

      doc.end();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la génération du PDF", error });
    }
  }
}
function sanitizePriseEnCharge(priseEnCharge: PriseEnCharge) {
  const { priseEnChargeArticles, ...sanitizedPriseEnCharge } = priseEnCharge;
  return {
    ...sanitizedPriseEnCharge,
    priseEnChargeArticles: priseEnChargeArticles.map((detail) => ({
      id: detail.id,
      quantite: detail.quantite,
      article: detail.article,
    })),
  };
}
