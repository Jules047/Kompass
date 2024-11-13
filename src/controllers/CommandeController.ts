import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Commande } from "../entities/Commande";
import { Article } from "../entities/Article";
import { Stock } from "../entities/Stock";
import { Client } from "../entities/Client";
import { MoyenPaiement } from "../entities/MoyenPaiement";
import { CommandeArticle } from "../entities/CommandeArticle";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { StockController } from "./StockController";

function cleanCircularReferences(obj: any, seen = new WeakSet()): any {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }
  if (seen.has(obj)) {
    return "[Circular Reference]";
  }
  seen.add(obj);
  const cleanObj: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "commande" && typeof value === "object") {
      cleanObj[key] = "[Commande Reference]";
    } else {
      cleanObj[key] = cleanCircularReferences(value, seen);
    }
  }
  return cleanObj;
}

const uploadDir = path.join(__dirname, "..", "..", "uploads", "signatures");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `signature_commande_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });
export class CommandeController {
  private commandeRepository = AppDataSource.getRepository(Commande);
  private clientRepository = AppDataSource.getRepository(Client);
  private articleRepository = AppDataSource.getRepository(Article);
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);
  private stockController = new StockController();

  async creerCommande(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const {
        clients_id,
        articles,
        moyens_paiement_id,
        acompte,
        ...commandeData
      } = request.body;

      const client = await queryRunner.manager.findOne(Client, {
        where: { id: clients_id },
      });
      const moyenPaiement = await queryRunner.manager.findOne(MoyenPaiement, {
        where: { id: moyens_paiement_id },
      });

      if (!client || !moyenPaiement) {
        throw new Error("Client ou Moyen de paiement non trouvé");
      }

      let totalTarif = 0;
      const warnings: string[] = [];

      const nouvelleCommande = new Commande();
      Object.assign(nouvelleCommande, {
        ...commandeData,
        client,
        moyenPaiement,
        date_creation: new Date(),
      });

      const commandeArticles: CommandeArticle[] = [];

      for (const articleData of articles) {
        const article = await queryRunner.manager.findOne(Article, {
          where: { id: articleData.id },
        });

        if (!article) {
          throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
        }

        if (articleData.quantite > article.quantite) {
          warnings.push(
            `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
          );
        }

        const commandeArticle = new CommandeArticle();
        commandeArticle.article = article;
        commandeArticle.quantite = articleData.quantite;
        commandeArticle.commande = nouvelleCommande;

        const prixArticle = Number(article.prix_ttc) * articleData.quantite;
        totalTarif += prixArticle;

        commandeArticles.push(commandeArticle);

        console.log(
          `Article ajouté: ${article.designation}, Prix: ${prixArticle}, Total actuel: ${totalTarif}`
        );
      }

      const acompteValue = Number(acompte) || 0;
      const reste_payer = Math.max(0, totalTarif - acompteValue);

      nouvelleCommande.tarif = totalTarif;
      nouvelleCommande.acompte = acompteValue;
      nouvelleCommande.reste_payer = reste_payer;
      nouvelleCommande.commandeArticles = commandeArticles;

      console.log(
        "Nouvelle commande avant sauvegarde:",
        JSON.stringify(cleanCircularReferences(nouvelleCommande), null, 2)
      );

      let commandeSauvegardee = await queryRunner.manager.save(
        Commande,
        nouvelleCommande
      );

      // Appeler la procédure stockée pour mettre à jour le stock
      await queryRunner.query("SELECT update_stock_from_commande($1)", [
        commandeSauvegardee.id,
      ]);

      console.log(
        "Commande sauvegardée:",
        JSON.stringify(cleanCircularReferences(commandeSauvegardee), null, 2)
      );

      await queryRunner.manager.update(Commande, commandeSauvegardee.id, {
        tarif: totalTarif,
        acompte: acompteValue,
        reste_payer: reste_payer,
      });

      await queryRunner.manager.save(CommandeArticle, commandeArticles);

      await queryRunner.commitTransaction();

      const commandeComplete = await queryRunner.manager.findOne(Commande, {
        where: { id: commandeSauvegardee.id },
        relations: [
          "client",
          "commandeArticles",
          "commandeArticles.article",
          "moyenPaiement",
        ],
      });

      console.log(
        "Commande complète après récupération:",
        JSON.stringify(cleanCircularReferences(commandeComplete), null, 2)
      );

      if (commandeComplete) {
        response.json({
          message: "Commande créée et mise à jour",
          commande: commandeComplete,
          warnings,
          needsRefresh: true,
        });
      } else {
        throw new Error(
          "Commande créée mais non trouvée lors de la récupération finale"
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la création de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de la création de la commande",
        error: (error as Error).message,
        needsRefresh: false,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async mettreAJourCommande(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const id = parseInt(request.params.id);
      const { acompte, articles, ...updateData } = request.body;

      let commande = await queryRunner.manager.findOne(Commande, {
        where: { id },
        relations: ["commandeArticles", "commandeArticles.article"],
      });

      if (!commande) {
        throw new Error("Commande non trouvée");
      }

      let totalTarif = 0;
      const warnings: string[] = [];

      await queryRunner.manager.remove(commande.commandeArticles);

      const newCommandeArticles = await Promise.all(
        articles.map(async (articleData: ArticleData) => {
          const article = await queryRunner.manager.findOne(Article, {
            where: { id: articleData.id },
          });

          if (!article) {
            throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
          }

          const commandeArticle = new CommandeArticle();
          if (commande) {
            commandeArticle.commande = commande;
          } else {
            throw new Error("Commande non trouvée");
          }
          commandeArticle.article = article;
          commandeArticle.quantite = articleData.quantite;

          if (articleData.quantite > article.quantite) {
            warnings.push(
              `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
            );
          }

          totalTarif += Number(article.prix_ttc) * articleData.quantite;
          return commandeArticle;
        })
      );

      const acompteValue = Number(acompte) || 0;
      const reste_payer = Math.max(0, totalTarif - acompteValue);

      Object.assign(commande, {
        ...updateData,
        tarif: totalTarif,
        acompte: acompteValue,
        reste_payer,
        commandeArticles: newCommandeArticles,
      });

      commande = await queryRunner.manager.save(Commande, commande);

      // Appeler la procédure stockée pour mettre à jour le stock
      await queryRunner.query("SELECT update_stock_from_commande($1)", [
        commande.id,
      ]);

      await queryRunner.commitTransaction();

      const savedCommande = await queryRunner.manager.findOne(Commande, {
        where: { id },
        relations: [
          "commandeArticles",
          "commandeArticles.article",
          "client",
          "moyenPaiement",
        ],
      });

      response.json({
        message: "Commande mise à jour",
        commande: savedCommande,
        warnings,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la mise à jour de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de la mise à jour de la commande",
        error: (error as Error).message,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async obtenirToutesLesCommandes(request: Request, response: Response) {
    try {
      const commandes = await this.commandeRepository.find({
        where: { annulee: false },
        relations: [
          "client",
          "commandeArticles",
          "commandeArticles.article",
          "moyenPaiement",
        ],
      });
      response.json(commandes);
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      response.status(500).json({
        message: "Erreur lors de la récupération des commandes",
        error,
      });
    }
  }

  async obtenirCommandeParId(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const commande = await this.commandeRepository.findOne({
        where: { id },
        relations: [
          "client",
          "commandeArticles",
          "commandeArticles.article",
          "moyenPaiement",
        ],
      });
      if (commande) {
        response.json(commande);
      } else {
        response.status(404).json({ message: "Commande non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de la récupération de la commande",
        error,
      });
    }
  }

  async supprimerCommande(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);

      // Fetch the command with all necessary relations
      const commande = await queryRunner.manager.findOne(Commande, {
        where: { id },
        relations: ["commandeArticles", "commandeArticles.article"],
      });

      if (!commande) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Commande non trouvée" });
      }

      // First, delete all stock records related to this command
      await queryRunner.query(`DELETE FROM stocks WHERE commande_id = $1`, [
        id,
      ]);

      // Then delete all related CommandeArticle records
      await queryRunner.manager.delete(CommandeArticle, { commande: { id } });

      // Delete signature file if exists
      if (commande.signature_path && fs.existsSync(commande.signature_path)) {
        fs.unlinkSync(commande.signature_path);
      }

      // Finally delete the command
      await queryRunner.manager.remove(Commande, commande);

      await queryRunner.commitTransaction();
      response.json({
        message: "Commande supprimée avec succès",
        success: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la suppression de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de la suppression de la commande",
        error,
        success: false,
      });
    } finally {
      await queryRunner.release();
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
      const commande = await this.commandeRepository.findOne({
        where: { id },
      });

      if (!commande) {
        return response.status(404).json({ message: "Commande non trouvée" });
      }

      if (commande.signature_path && fs.existsSync(commande.signature_path)) {
        fs.unlinkSync(commande.signature_path);
      }

      if (request.file) {
        commande.signature_path = request.file.path;
        await this.commandeRepository.save(commande);
        response.json({
          message: "Signature uploadée avec succès🥰",
          commande,
        });
      } else {
        response.status(400).json({ message: "Aucun fichier n'a été uploadé" });
      }
    });
  }

  async generatePDF(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const commande = await this.commandeRepository.findOne({
        where: { id },
        relations: [
          "client",
          "commandeArticles",
          "commandeArticles.article",
          "moyenPaiement",
        ],
      });

      if (!commande) {
        return response.status(404).json({ message: "Commande non trouvée" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `Com${String(commande.id).padStart(4, "0")}.pdf`;

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
      doc.fontSize(25).text("Commande", { align: "center" });
      doc.moveDown();

      // Informations de la commande (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: Com${String(commande.id).padStart(4, "0")}`);
      doc.text(
        `Date: ${new Date(commande.date_creation).toLocaleDateString()}`
      );
      doc.text(`Moyen de paiement: ${commande.moyenPaiement.moyen}`);
      doc.moveDown();
      doc.text(`Commentaire: ${commande.commentaire || "Aucun commentaire"}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(
        `Client: ${commande.client.nom} ${commande.client.prenom}`,
        400,
        startY
      );
      doc.text(`Adresse: ${commande.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${commande.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${commande.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${commande.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${commande.client.email}`, 400, doc.y);

      doc.moveDown();

      // Tableau des articles
      const tableTop = 250;
      const tableLeft = 50;
      const rowHeight = 30;

      doc.font("Helvetica-Bold");
      doc.text("Désignation", tableLeft, tableTop);
      doc.text("Quantité", tableLeft + 250, tableTop);
      doc.text("Prix TTC", tableLeft + 350, tableTop);

      doc.font("Helvetica");
      let yPosition = tableTop + rowHeight;

      commande.commandeArticles.forEach((detail) => {
        const article = detail.article;
        doc.text(article.designation, tableLeft, yPosition);
        doc.text(detail.quantite.toString(), tableLeft + 250, yPosition);
        doc.text(
          (Number(article.prix_ttc) * detail.quantite).toFixed(2) + " €",
          tableLeft + 350,
          yPosition
        );
        yPosition += rowHeight;
      });

      const bottomOfQuantityColumn = yPosition;
      doc.y = bottomOfQuantityColumn;

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(
        `Total: ${commande.tarif.toFixed(2)} €`,
        tableLeft + 315,
        doc.y,
        {
          align: "left",
        }
      );
      doc.text(
        `Acompte: ${commande.acompte.toFixed(2)} €`,
        tableLeft + 315,
        doc.y + 20,
        {
          align: "left",
        }
      );
      doc.text(
        `Reste à payer: ${commande.reste_payer.toFixed(2)} €`,
        tableLeft + 315,
        doc.y + 40,
        {
          align: "left",
        }
      );

      // Signature
      if (commande.signature_path && fs.existsSync(commande.signature_path)) {
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
          commande.signature_path,
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

  // async annulerCommande(request: Request, response: Response) {
  //   try {
  //     const id = parseInt(request.params.id);
  //     const commande = await this.commandeRepository.findOne({
  //       where: { id },
  //     });
  //     if (!commande) {
  //       return response.status(404).json({ message: "Commande non trouvée" });
  //     }
  //     commande.annulee = true;
  //     commande.date_annulation = new Date();
  //     await this.commandeRepository.save(commande);
  //     response.json({ message: "Commande annulée", commande });
  //   } catch (error) {
  //     console.error("Erreur lors de l'annulation de la commande:", error);
  //     response
  //       .status(500)
  //       .json({
  //         message: "Erreur lors de l'annulation de la commande",
  //         error,
  //       });
  //   }
  // }

  async annulerCommande(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);
      const commande = await queryRunner.manager.findOne(Commande, {
        where: { id },
        relations: ["commandeArticles", "commandeArticles.article"],
      });
      if (!commande) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Commande non trouvée" });
      }

      commande.annulee = true;
      commande.date_annulation = new Date();

      for (const commandeArticle of commande.commandeArticles) {
        // Remettre les unités en stock
        const stockEntree = queryRunner.manager.create(Stock, {
          articles_id: commandeArticle.article.id,
          entree: commandeArticle.quantite,
          sortie: 0,
          date_entree: new Date(),
        });
        await queryRunner.manager.save(stockEntree);

        // Mettre à jour la quantité de l'article
        commandeArticle.article.quantite += commandeArticle.quantite;
        await queryRunner.manager.save(commandeArticle.article);
      }

      await queryRunner.manager.save(commande);

      await queryRunner.commitTransaction();

      response.json({
        message: "Commande annulée et stock mis à jour",
        commande,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de l'annulation de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de l'annulation de la commande",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async obtenirCommandesAnnulees(request: Request, response: Response) {
    try {
      const commandesAnnulees = await this.commandeRepository.find({
        where: { annulee: true },
        relations: [
          "client",
          "commandeArticles",
          "commandeArticles.article",
          "moyenPaiement",
        ],
      });
      const commandesFormateesAnnulees = commandesAnnulees.map((commande) => ({
        id: commande.id,
        numero: `Com${String(commande.id).padStart(2, "0")}`,
        client: {
          nom: commande.client.nom,
          prenom: commande.client.prenom,
        },
        commandeArticles: commande.commandeArticles.map((ca) => ({
          article: {
            designation: ca.article.designation,
          },
          quantite: ca.quantite,
        })),
        tarif: commande.tarif,
        date_creation: commande.date_creation,
        date_commande: commande.date_commande,
        date_arrivee: commande.date_arrivee,
        updatedAt: commande.updatedAt,
        commentaire: commande.commentaire,
      }));
      response.json(commandesFormateesAnnulees);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des commandes annulées:",
        error
      );
      response.status(500).json({
        message: "Erreur lors de la récupération des commandes annulées",
        error: (error as Error).message,
      });
    }
  }

  async restaurerCommande(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);
      const commande = await this.commandeRepository.findOne({
        where: { id },
        relations: ["commandeArticles", "commandeArticles.article"],
      });
      if (!commande) {
        await queryRunner.rollbackTransaction();
        return response.status(404).json({ message: "Commande non trouvée" });
      }

      commande.annulee = false;
      commande.date_annulation = null;

      for (const commandeArticle of commande.commandeArticles) {
        // Mettre à jour le stock
        const stockSortie = queryRunner.manager.create(Stock, {
          articles_id: commandeArticle.article.id,
          entree: 0,
          sortie: commandeArticle.quantite,
          date_sortie: new Date(),
        });
        await queryRunner.manager.save(stockSortie);

        // Mettre à jour la quantité de l'article
        commandeArticle.article.quantite -= commandeArticle.quantite;
        await queryRunner.manager.save(commandeArticle.article);
      }

      await queryRunner.manager.save(commande);

      await queryRunner.commitTransaction();

      response.json({ message: "Commande restaurée", commande });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la restauration de la commande:", error);
      response.status(500).json({
        message: "Erreur lors de la restauration de la commande",
        error,
      });
    } finally {
      await queryRunner.release();
    }
  }

  async mettreAJourDescription(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const { description } = request.body;
      console.log("Description reçue:", description);
      const commande = await this.commandeRepository.findOne({
        where: { id },
      });
      if (!commande) {
        return response.status(404).json({ message: "Commande non trouvée" });
      }
      commande.commentaire = description;
      await this.commandeRepository.save(commande);
      response.json({ message: "Description mise à jour", commande });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la description:", error);
      response.status(500).json({
        message: "Erreur lors de la mise à jour de la description",
        error,
      });
    }
  }
}

interface ArticleData {
  id: number;
  quantite: number;
}
