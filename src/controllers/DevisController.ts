import PDFDocument from "pdfkit";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Devis } from "../entities/Devis";
import { Client } from "../entities/Client";
import { Article } from "../entities/Article";
import { MoyenPaiement } from "../entities/MoyenPaiement";
import { DevisArticle } from "../entities/DevisArticle";
import multer from "multer";
import path from "path";
import fs from "fs";

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

export class DevisController {
  private devisRepository = AppDataSource.getRepository(Devis);
  private clientRepository = AppDataSource.getRepository(Client);
  private articleRepository = AppDataSource.getRepository(Article);
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);

  // async createDevis(request: Request, response: Response) {
  //   try {
  //     const {
  //       clients_id,
  //       articles,
  //       moyens_paiement_id,
  //       acompte,
  //       ...devisData
  //     } = request.body;

  //     const client = await this.clientRepository.findOne({
  //       where: { id: clients_id },
  //     });
  //     const moyenPaiement = await this.moyenPaiementRepository.findOne({
  //       where: { id: moyens_paiement_id },
  //     });

  //     if (!client || !moyenPaiement) {
  //       return response.status(404).json({
  //         message: "Client ou Moyen de paiement non trouvé",
  //       });
  //     }

  //     let totalTarif = 0;
  //     let devisArticles: Article[] = [];
  //     let warnings: string[] = [];

  //     if (Array.isArray(articles)) {
  //       for (let articleData of articles) {
  //         const article = await this.articleRepository.findOne({
  //           where: { id: articleData.id },
  //         });

  //         if (!article) {
  //           return response.status(404).json({
  //             message: `Article avec l'ID ${articleData.id} non trouvé`,
  //           });
  //         }

  //         if (articleData.quantite > article.quantite) {
  //           warnings.push(
  //             `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
  //           );
  //         }

  //         const articleTarif =
  //           Number(article.prix_ttc) * Number(articleData.quantite);
  //         totalTarif += articleTarif;

  //         const devisArticle = new Article();
  //         Object.assign(devisArticle, article);
  //         devisArticle.quantite = articleData.quantite;
  //         devisArticles.push(devisArticle);
  //       }
  //     } else {
  //       return response.status(400).json({
  //         message: "Les articles doivent être fournis sous forme de tableau",
  //       });
  //     }

  //     const acompteValue = Number(acompte) || 0;
  //     const reste_payer = Math.max(0, totalTarif - acompteValue);

  //     const devis = this.devisRepository.create({
  //       ...devisData,
  //       clients_id,
  //       moyens_paiement_id,
  //       tarif: totalTarif,
  //       acompte: acompteValue,
  //       reste_payer,
  //       client,
  //       article: devisArticles,
  //       moyenPaiement,
  //     });

  //     await this.devisRepository.save(devis);

  //     response.json({ message: "Devis créé", devis, warnings });
  //   } catch (error) {
  //     console.error("Erreur lors de la création du devis:", error);
  //     response
  //       .status(500)
  //       .json({ message: "Erreur lors de la création du devis", error });
  //   }
  // }

  async createDevis(request: Request, response: Response): Promise<Response> {
    try {
      const {
        clients_id,
        articles,
        moyens_paiement_id,
        acompte,
        ...devisData
      } = request.body;

      const client = await this.clientRepository.findOne({
        where: { id: clients_id },
      });
      const moyenPaiement = await this.moyenPaiementRepository.findOne({
        where: { id: moyens_paiement_id },
      });

      if (!client || !moyenPaiement) {
        return response
          .status(404)
          .json({ message: "Client ou Moyen de paiement non trouvé" });
      }

      let totalTarif = 0;
      let devisArticles = [];
      let warnings = [];

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

          if (articleData.quantite > article.quantite) {
            warnings.push(
              `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
            );
          }

          const articleTarif =
            Number(article.prix_ttc) * Number(articleData.quantite);
          totalTarif += articleTarif;

          const devisArticle = new DevisArticle();
          devisArticle.article = article;
          devisArticle.quantite = articleData.quantite;
          devisArticles.push(devisArticle);
        }
      } else {
        return response.status(400).json({
          message: "Les articles doivent être fournis sous forme de tableau",
        });
      }

      const acompteValue = Number(acompte) || 0;
      const reste_payer = Math.max(0, totalTarif - acompteValue);

      const nouveauDevis = new Devis();
      Object.assign(nouveauDevis, {
        ...devisData,
        clients_id,
        moyens_paiement_id,
        tarif: totalTarif,
        acompte: acompteValue,
        reste_payer,
        client,
        devisArticles,
        moyenPaiement,
      });

      const devisSauvegarde = await this.devisRepository.save(nouveauDevis);

      const devisComplet = await this.devisRepository.findOne({
        where: { id: devisSauvegarde.id },
        relations: [
          "client",
          "devisArticles",
          "devisArticles.article",
          "moyenPaiement",
        ],
      });

      if (devisComplet) {
        return response.json({ message: "Devis créé", devis: devisComplet, warnings });
      } else {
        return response.status(404).json({
          message: "Devis créé mais non trouvé lors de la récupération",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la création du devis", error });
    }
  }
  async updateDevis(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      const devis = await this.devisRepository.findOne({
        where: { id },
        relations: ["devisArticles", "devisArticles.article"],
      });

      if (!devis) {
        return response.status(404).json({ message: "Devis non trouvé" });
      }

      const { acompte, articles, ...updateData } = request.body;

      let totalTarif = 0;
      let newDevisArticles: DevisArticle[] = [];
      let warnings: string[] = [];

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

          const devisArticle = new DevisArticle();
          devisArticle.article = article;
          devisArticle.quantite = articleData.quantite;
          devisArticle.devis = devis;
          newDevisArticles.push(devisArticle);

          if (articleData.quantite > article.quantite) {
            warnings.push(
              `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
            );
          }

          const articleTarif =
            Number(article.prix_ttc) * Number(articleData.quantite);
          totalTarif += articleTarif;
        }
      } else {
        return response.status(400).json({
          message: "Les articles doivent être fournis sous forme de tableau",
        });
      }

      const acompteValue = Number(acompte) || 0;
      const reste_payer = Math.max(0, totalTarif - acompteValue);

      // Supprimer les anciens DevisArticles
      await this.devisRepository
        .createQueryBuilder()
        .relation(Devis, "devisArticles")
        .of(devis)
        .remove(devis.devisArticles);

      // Mettre à jour le devis
      Object.assign(devis, {
        ...updateData,
        tarif: totalTarif,
        acompte: acompteValue,
        reste_payer,
      });

      // Sauvegarder le devis mis à jour
      const updatedDevis = await this.devisRepository.save(devis);

      // Ajouter les nouveaux DevisArticles
      updatedDevis.devisArticles = newDevisArticles;
      await this.devisRepository.save(updatedDevis);

      const savedDevis = await this.devisRepository.findOne({
        where: { id },
        relations: [
          "client",
          "devisArticles",
          "devisArticles.article",
          "moyenPaiement",
        ],
      });

      return response.json({
        message: "Devis mis à jour",
        devis: savedDevis,
        warnings,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du devis:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du devis", error });
    }
  }
  async getAllDevis(request: Request, response: Response) {
    try {
      const devis = await this.devisRepository.find({
        relations: [
          "client",
          "devisArticles",
          "devisArticles.article",
          "moyenPaiement",
        ],
      });
      response.json(devis);
    } catch (error) {
      console.error("Erreur lors de la récupération des devis:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération des devis", error });
    }
  }

  async getDevisById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const devis = await this.devisRepository.findOne({
        where: { id },
        relations: [
          "client",
          "devisArticles",
          "devisArticles.article",
          "moyenPaiement",
        ],
      });
      if (devis) {
        response.json(devis);
      } else {
        response.status(404).json({ message: "Devis non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du devis:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération du devis", error });
    }
  }

  // async updateDevis(request: Request, response: Response) {
  //   try {
  //     const id = parseInt(request.params.id);
  //     const devis = await this.devisRepository.findOne({
  //       where: { id },
  //       relations: ["article"],
  //     });
  //     if (!devis) {
  //       return response.status(404).json({ message: "Devis non trouvé" });
  //     }

  //     const { acompte, articles, ...updateData } = request.body;

  //     let totalTarif = 0;
  //     let devisArticles = [];
  //     let warnings = [];

  //     if (!articles || !Array.isArray(articles)) {
  //       return response.status(400).json({
  //         message: "Les articles doivent être fournis sous forme de tableau",
  //       });
  //     }

  //     for (let articleData of articles) {
  //       const article = await this.articleRepository.findOne({
  //         where: { id: articleData.id },
  //       });

  //       if (!article) {
  //         return response.status(404).json({
  //           message: `Article avec l'ID ${articleData.id} non trouvé`,
  //         });
  //       }

  //       devisArticles.push({
  //         ...article,
  //         quantite: articleData.quantite, // Assurez-vous que cette ligne existe
  //       });

  //       if (articleData.quantite > article.quantite) {
  //         warnings.push(
  //           `La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`
  //         );
  //       }

  //       const articleTarif =
  //         Number(article.prix_ttc) * Number(articleData.quantite);
  //       totalTarif += articleTarif;

  //       devisArticles.push({
  //         ...article,
  //         quantite: articleData.quantite,
  //       });
  //     }

  //     const acompteValue = Number(acompte) || 0;
  //     const reste_payer = Math.max(0, totalTarif - acompteValue);

  //     const updatedDevis = Object.assign(devis, {
  //       ...updateData,
  //       article: devisArticles,
  //       tarif: totalTarif,
  //       acompte: acompteValue,
  //       reste_payer,
  //     });

  //     await this.devisRepository.save(updatedDevis);
  //     response.json({
  //       message: "Devis mis à jour",
  //       devis: updatedDevis,
  //       warnings,
  //     });
  //   } catch (error) {
  //     console.error("Erreur lors de la mise à jour du devis:", error);
  //     response
  //       .status(500)
  //       .json({ message: "Erreur lors de la mise à jour du devis", error });
  //   }
  // }

  async deleteDevis(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      const devis = await this.devisRepository.findOne({ where: { id } });
      if (!devis) {
        return response.status(404).json({ message: "Devis non trouvé" });
      }
      if (devis.signature_path) {
        fs.unlinkSync(devis.signature_path);
      }
      await this.devisRepository.remove(devis);
      return response.json({ message: "Devis supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du devis:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la suppression du devis", error });
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
      const devis = await this.devisRepository.findOne({ where: { id } });

      if (!devis) {
        return response.status(404).json({ message: "Devis non trouvé" });
      }

      if (devis.signature_path && fs.existsSync(devis.signature_path)) {
        fs.unlinkSync(devis.signature_path);
      }

      if (request.file) {
        devis.signature_path = request.file.path;
        await this.devisRepository.save(devis);
        return response.json({ message: "Signature uploadée avec succès🥰", devis });
      } else {
        return response.status(400).json({ message: "Aucun fichier n'a été uploadé" });
      }
    });  }

  async generatePDF(request: Request, response: Response): Promise<void | Response> {
    try {
      const id = parseInt(request.params.id);
      const devis = await this.devisRepository.findOne({
        where: { id },
        relations: [
          "client",
          "devisArticles",
          "devisArticles.article",
          "moyenPaiement",
        ],
      });

      if (!devis) {
        return response.status(404).json({ message: "Devis non trouvé" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `Dev${String(devis.id).padStart(4, "0")}.pdf`;

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
      doc.fontSize(25).text("Devis", { align: "center" });
      doc.moveDown();

      // Informations du devis (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: Dev${String(devis.id).padStart(4, "0")}`);
      doc.text(`Date: ${new Date(devis.date).toLocaleDateString()}`);
      doc.text(`Moyen de paiement: ${devis.moyenPaiement.moyen}`);
      doc.moveDown();
      doc.text(`Commentaire: ${devis.commentaire}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(
        `Client: ${devis.client.nom} ${devis.client.prenom}`,
        400,
        startY
      );
      doc.text(`Adresse: ${devis.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${devis.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${devis.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${devis.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${devis.client.email}`, 400, doc.y);

      doc.moveDown();

      // Tableau des articles
      const tableTop = 220;
      const tableLeft = 50;
      const rowHeight = 30;

      doc.font("Helvetica-Bold");
      doc.text("Désignation", tableLeft, tableTop);
      doc.text("Quantité", tableLeft + 250, tableTop);
      doc.text("Prix TTC", tableLeft + 350, tableTop);

      doc.font("Helvetica");
      let yPosition = tableTop + rowHeight;

      devis.devisArticles.forEach((devisArticle) => {
        const article = devisArticle.article;
        doc.text(article.designation, tableLeft, yPosition);
        doc.text(devisArticle.quantite.toString(), tableLeft + 250, yPosition);
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

      // After adding the articles to the PDF
      const bottomOfQuantityColumn = yPosition;

      // Move to the bottom of the "Quantité" column
      doc.y = bottomOfQuantityColumn;

      doc.moveDown();
      doc.font("Helvetica-Bold");
      doc.text(`Total: ${devis.tarif.toFixed(2)} €`, tableLeft + 315, doc.y, {
        align: "left",
      });
      doc.text(
        `Acompte: ${devis.acompte.toFixed(2)} €`,
        tableLeft + 315,
        doc.y + rowHeight,
        {
          align: "left",
        }
      );
      doc.text(
        `Reste à payer: ${devis.reste_payer.toFixed(2)} €`,
        tableLeft + 315,
        doc.y + rowHeight,
        {
          align: "left",
        }
      );

      // Signature
      if (devis.signature_path && fs.existsSync(devis.signature_path)) {
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
          devis.signature_path,
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
      return response
        .status(500)
        .json({ message: "Erreur lors de la génération du PDF", error });
    }
  }}
