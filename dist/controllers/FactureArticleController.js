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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FactureArticleController = void 0;
const data_source_1 = require("../data-source");
const FactureArticle_1 = require("../entities/FactureArticle");
const Client_1 = require("../entities/Client");
const Article_1 = require("../entities/Article");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
const FactureArticleDetail_1 = require("../entities/FactureArticleDetail");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
class FactureArticleController {
    constructor() {
        this.factureArticleRepository = data_source_1.AppDataSource.getRepository(FactureArticle_1.FactureArticle);
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
        this.factureArticleDetailRepository = data_source_1.AppDataSource.getRepository(FactureArticleDetail_1.FactureArticleDetail);
    }
    createFactureArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = request.body, { clients_id, articles, moyens_paiement_id, montant_regle } = _a, factureData = __rest(_a, ["clients_id", "articles", "moyens_paiement_id", "montant_regle"]);
                const client = yield this.clientRepository.findOne({
                    where: { id: clients_id },
                });
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({
                    where: { id: moyens_paiement_id },
                });
                if (!client || !moyenPaiement) {
                    return response.status(404).json({
                        message: "Client ou Moyen de paiement non trouvé",
                    });
                }
                let montantInitial = 0;
                let factureArticleDetails = [];
                if (Array.isArray(articles)) {
                    for (let articleData of articles) {
                        const article = yield this.articleRepository.findOne({
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            return response.status(404).json({
                                message: `Article avec l'ID ${articleData.id} non trouvé`,
                            });
                        }
                        const articleMontant = Number(article.prix_ttc) * Number(articleData.quantite);
                        montantInitial += articleMontant;
                        const factureArticleDetail = new FactureArticleDetail_1.FactureArticleDetail();
                        factureArticleDetail.article = article;
                        factureArticleDetail.quantite = articleData.quantite;
                        factureArticleDetails.push(factureArticleDetail);
                    }
                }
                else {
                    return response.status(400).json({
                        message: "Les articles doivent être fournis sous forme de tableau",
                    });
                }
                const montantRegleValue = Number(montant_regle) || 0;
                const solde_du = Math.max(0, montantInitial - montantRegleValue);
                const nouvelleFacture = new FactureArticle_1.FactureArticle();
                Object.assign(nouvelleFacture, Object.assign(Object.assign({}, factureData), { clients_id,
                    moyens_paiement_id, montant_initial: montantInitial, montant_regle: montantRegleValue, solde_du,
                    client,
                    factureArticleDetails,
                    moyenPaiement }));
                const factureSauvegardee = yield this.factureArticleRepository.save(nouvelleFacture);
                const factureComplete = yield this.factureArticleRepository.findOne({
                    where: { id: factureSauvegardee.id },
                    relations: [
                        "client",
                        "factureArticleDetails",
                        "factureArticleDetails.article",
                        "moyenPaiement",
                    ],
                });
                if (factureComplete) {
                    return response.json({
                        message: "Facture article créée",
                        facture: factureComplete,
                    });
                }
                else {
                    return response.status(404).json({
                        message: "Facture article créée mais non trouvée lors de la récupération",
                    });
                }
            }
            catch (error) {
                console.error("Erreur lors de la création de la facture article:", error);
                return response.status(500).json({
                    message: "Erreur lors de la création de la facture article",
                    error,
                });
            }
        });
    }
    getAllFacturesArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const facturesArticle = yield this.factureArticleRepository.find({
                    relations: [
                        "client",
                        "factureArticleDetails",
                        "factureArticleDetails.article",
                        "moyenPaiement",
                    ],
                });
                response.json(facturesArticle);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des factures article:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération des factures article",
                    error,
                });
            }
        });
    }
    getFactureArticleById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const factureArticle = yield this.factureArticleRepository.findOne({
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
                }
                else {
                    response.status(404).json({ message: "Facture article non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de la facture article:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération de la facture article",
                    error,
                });
            }
        });
    }
    updateFactureArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const factureArticle = yield this.factureArticleRepository.findOne({
                    where: { id },
                    relations: ["factureArticleDetails"],
                });
                if (!factureArticle) {
                    return response
                        .status(404)
                        .json({ message: "Facture article non trouvée" });
                }
                const _a = request.body, { articles } = _a, updateData = __rest(_a, ["articles"]);
                if (factureArticle.factureArticleDetails) {
                    yield this.factureArticleDetailRepository.remove(factureArticle.factureArticleDetails);
                }
                const newFactureArticleDetails = [];
                let totalMontant = 0;
                for (const articleData of articles) {
                    const article = yield this.articleRepository.findOne({
                        where: { id: articleData.id },
                    });
                    if (!article) {
                        return response.status(404).json({
                            message: `Article avec l'ID ${articleData.id} non trouvé`,
                        });
                    }
                    const detail = new FactureArticleDetail_1.FactureArticleDetail();
                    detail.article = article;
                    detail.quantite = articleData.quantite;
                    detail.factureArticle = factureArticle;
                    newFactureArticleDetails.push(detail);
                    totalMontant += article.prix_ttc * articleData.quantite;
                }
                Object.assign(factureArticle, Object.assign(Object.assign({}, updateData), { montant_initial: totalMontant, solde_du: totalMontant - (updateData.montant_regle || 0), factureArticleDetails: newFactureArticleDetails }));
                yield this.factureArticleRepository.save(factureArticle);
                const updatedFactureArticle = yield this.factureArticleRepository.findOne({
                    where: { id },
                    relations: [
                        "client",
                        "factureArticleDetails",
                        "factureArticleDetails.article",
                        "moyenPaiement",
                    ],
                });
                return response.json({
                    message: "Facture article mise à jour",
                    factureArticle: updatedFactureArticle,
                });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour de la facture article:", error);
                return response.status(500).json({
                    message: "Erreur lors de la mise à jour de la facture article",
                    error,
                });
            }
        });
    }
    deleteFactureArticle(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const factureArticle = yield this.factureArticleRepository.findOne({
                    where: { id },
                    relations: ["factureArticleDetails"],
                });
                if (!factureArticle) {
                    return response
                        .status(404)
                        .json({ message: "Facture article non trouvée" });
                }
                yield this.factureArticleRepository.remove(factureArticle);
                return response.json({ message: "Facture article supprimée" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression de la facture article:", error);
                return response.status(500).json({
                    message: "Erreur lors de la suppression de la facture article",
                    error,
                });
            }
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const factureArticle = yield this.factureArticleRepository.findOne({
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
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `FCT${String(factureArticle.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, { fit: [60, 100] });
                doc.moveDown();
                doc.fontSize(25).text("Facture", { align: "center" });
                doc.moveDown();
                doc.fontSize(12);
                const startY = doc.y;
                doc.text(`Numéro: FCT${String(factureArticle.id).padStart(4, "0")}`);
                doc.text(`Date: ${new Date(factureArticle.date).toLocaleDateString()}`);
                doc.moveDown();
                doc.text(`Moyen de paiement: ${factureArticle.moyenPaiement.moyen}`);
                doc.text(`Commentaire: ${factureArticle.commentaire}`);
                doc.fontSize(12);
                doc.text(`Client: ${factureArticle.client.nom} ${factureArticle.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${factureArticle.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${factureArticle.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${factureArticle.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${factureArticle.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${factureArticle.client.email}`, 400, doc.y);
                doc.moveDown();
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
                    doc.text(Number(article.prix_ttc).toFixed(2) + " €", tableLeft + 350, yPosition);
                    yPosition += rowHeight;
                });
                const bottomOfQuantityColumn = yPosition;
                doc.y = bottomOfQuantityColumn;
                doc.moveDown();
                doc.font("Helvetica-Bold");
                doc.text(`Total TTC: ${factureArticle.montant_initial.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.moveDown();
                doc.text(`Montant réglé: ${factureArticle.montant_regle.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.moveDown();
                doc.text(`Solde dû: ${factureArticle.solde_du.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.end();
            }
            catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la génération du PDF", error });
            }
        });
    }
}
exports.FactureArticleController = FactureArticleController;
//# sourceMappingURL=FactureArticleController.js.map