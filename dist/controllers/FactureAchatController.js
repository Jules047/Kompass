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
exports.factureAchatController = exports.FactureAchatController = void 0;
const data_source_1 = require("../data-source");
const FactureAchat_1 = require("../entities/FactureAchat");
const Fournisseur_1 = require("../entities/Fournisseur");
const Article_1 = require("../entities/Article");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
const FactureAchatDetail_1 = require("../entities/FactureAchatDetail");
const pdfkit_1 = __importDefault(require("pdfkit"));
const StockController_1 = require("./StockController");
const path_1 = __importDefault(require("path"));
class FactureAchatController {
    constructor() {
        this.factureAchatRepository = data_source_1.AppDataSource.getRepository(FactureAchat_1.FactureAchat);
        this.fournisseurRepository = data_source_1.AppDataSource.getRepository(Fournisseur_1.Fournisseur);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
        this.stockController = new StockController_1.StockController();
    }
    getFactureAchatById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(req.params.id);
                const factureAchat = yield this.factureAchatRepository.findOne({
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
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Erreur lors de la récupération de la facture d'achat",
                });
            }
        });
    }
    getAllFacturesAchat(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const facturesAchat = yield this.factureAchatRepository.find({
                    relations: [
                        "fournisseur",
                        "moyenPaiement",
                        "factureAchatDetails",
                        "factureAchatDetails.article",
                    ],
                });
                res.json(facturesAchat);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({
                    message: "Erreur lors de la récupération des factures d'achat",
                });
            }
        });
    }
    createFactureAchat(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const _a = request.body, { fournisseurs_id, articles, moyens_paiement_id, montant_regle } = _a, factureData = __rest(_a, ["fournisseurs_id", "articles", "moyens_paiement_id", "montant_regle"]);
                const fournisseur = yield this.fournisseurRepository.findOne({
                    where: { id: fournisseurs_id },
                });
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({
                    where: { id: moyens_paiement_id },
                });
                if (!fournisseur || !moyenPaiement) {
                    response.status(404).json({
                        message: "Fournisseur ou Moyen de paiement non trouvé",
                    });
                    return;
                }
                let montantInitial = 0;
                let factureAchatDetails = [];
                if (Array.isArray(articles)) {
                    for (let articleData of articles) {
                        const article = yield this.articleRepository.findOne({
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            response.status(404).json({
                                message: `Article avec l'ID ${articleData.id} non trouvé`,
                            });
                            return;
                        }
                        const articleMontant = Number(article.prix_ttc) * Number(articleData.quantite);
                        montantInitial += articleMontant;
                        const factureAchatDetail = new FactureAchatDetail_1.FactureAchatDetail();
                        factureAchatDetail.article = article;
                        factureAchatDetail.quantite = articleData.quantite;
                        factureAchatDetails.push(factureAchatDetail);
                    }
                }
                else {
                    response.status(400).json({
                        message: "Les articles doivent être fournis sous forme de tableau",
                    });
                    return;
                }
                const montantRegleValue = Number(montant_regle) || 0;
                const solde_du = Math.max(0, montantInitial - montantRegleValue);
                const nouvelleFacture = new FactureAchat_1.FactureAchat();
                Object.assign(nouvelleFacture, Object.assign(Object.assign({}, factureData), { fournisseurs_id,
                    moyens_paiement_id, prix_total: montantInitial, montant_regle: montantRegleValue, solde_du,
                    fournisseur,
                    factureAchatDetails,
                    moyenPaiement }));
                const factureSauvegardee = yield queryRunner.manager.save(nouvelleFacture);
                yield this.stockController.updateStockFromFactureAchat(queryRunner, factureSauvegardee);
                yield queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
                    fournisseurs_id,
                ]);
                yield queryRunner.commitTransaction();
                const factureComplete = yield this.factureAchatRepository.findOne({
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
                }
                else {
                    response.status(404).json({
                        message: "Facture achat créée mais non trouvée lors de la récupération",
                    });
                }
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la création de la facture achat:", error);
                response.status(500).json({
                    message: "Erreur lors de la création de la facture achat",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    updateFactureAchat(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const { articles, montant_regle, commentaire, date, moyens_paiement_id, fournisseurs_id, } = request.body;
                const factureAchat = yield queryRunner.manager.findOne(FactureAchat_1.FactureAchat, {
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
                    const newFournisseur = yield queryRunner.manager.findOne(Fournisseur_1.Fournisseur, {
                        where: { id: fournisseurs_id },
                    });
                    if (!newFournisseur) {
                        throw new Error(`Fournisseur with id ${fournisseurs_id} not found`);
                    }
                    factureAchat.fournisseur = newFournisseur;
                }
                if (moyens_paiement_id) {
                    const newMoyenPaiement = yield queryRunner.manager.findOne(MoyenPaiement_1.MoyenPaiement, { where: { id: moyens_paiement_id } });
                    if (!newMoyenPaiement) {
                        throw new Error(`Moyen de paiement with id ${moyens_paiement_id} not found`);
                    }
                    factureAchat.moyenPaiement = newMoyenPaiement;
                }
                factureAchat.date = new Date(date);
                factureAchat.commentaire = commentaire;
                factureAchat.montant_regle = parseFloat(montant_regle);
                if (Array.isArray(articles)) {
                    yield queryRunner.manager.remove(FactureAchatDetail_1.FactureAchatDetail, factureAchat.factureAchatDetails);
                    let newPrixTotal = 0;
                    const newFactureAchatDetails = [];
                    for (const articleData of articles) {
                        const article = yield queryRunner.manager.findOne(Article_1.Article, {
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            throw new Error(`Article with id ${articleData.id} not found`);
                        }
                        const detail = new FactureAchatDetail_1.FactureAchatDetail();
                        detail.article = article;
                        detail.quantite = articleData.quantite;
                        detail.factureAchat = factureAchat;
                        newFactureAchatDetails.push(detail);
                        newPrixTotal += article.prix_ttc * articleData.quantite;
                    }
                    factureAchat.factureAchatDetails = newFactureAchatDetails;
                    factureAchat.prix_total = newPrixTotal;
                    factureAchat.solde_du = Math.max(0, newPrixTotal - factureAchat.montant_regle);
                }
                const updatedFacture = yield queryRunner.manager.save(FactureAchat_1.FactureAchat, factureAchat);
                yield this.stockController.updateStockFromFactureAchat(queryRunner, updatedFacture);
                yield queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
                    oldFournisseurId,
                ]);
                if (fournisseurs_id && fournisseurs_id !== oldFournisseurId) {
                    yield queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
                        fournisseurs_id,
                    ]);
                }
                yield queryRunner.commitTransaction();
                response.json({
                    message: "Facture d'achat mise à jour avec succès🥰",
                    factureAchat: sanitizeFactureAchat(updatedFacture),
                });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Error updating facture achat:", error);
                response.status(500).json({
                    message: "Erreur lors de la mise à jour de la facture d'achat",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    deleteFactureAchat(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const factureAchat = yield this.factureAchatRepository.findOne({
                    where: { id },
                    relations: ["stocks", "factureAchatDetails"],
                });
                if (factureAchat) {
                    if (factureAchat.stocks) {
                        yield queryRunner.manager.remove(factureAchat.stocks);
                    }
                    yield queryRunner.manager.remove(factureAchat);
                    yield queryRunner.commitTransaction();
                    response.json({ message: "Facture d'achat supprimée avec succès" });
                }
                else {
                    response.status(404).json({ message: "Facture d'achat non trouvée" });
                }
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la suppression de la facture d'achat:", error);
                response.status(500).json({
                    message: "Erreur lors de la suppression de la facture d'achat",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const factureAchat = yield this.factureAchatRepository.findOne({
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
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `FACA${String(factureAchat.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, { fit: [60, 100] });
                doc.moveDown();
                doc.fontSize(25).text("Facture d'Achat", { align: "center" });
                doc.moveDown();
                doc.fontSize(12);
                const startY = doc.y;
                doc.text(`Numéro: FACA${String(factureAchat.id).padStart(4, "0")}`);
                doc.text(`Date: ${new Date(factureAchat.date).toLocaleDateString()}`);
                doc.moveDown();
                doc.text(`Moyen de paiement: ${factureAchat.moyenPaiement.moyen}`);
                doc.text(`Commentaire: ${factureAchat.commentaire}`);
                doc.fontSize(12);
                doc.text(`Fournisseur: ${factureAchat.fournisseur.societe}`, 400, startY);
                doc.text(`Adresse: ${factureAchat.fournisseur.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${factureAchat.fournisseur.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${factureAchat.fournisseur.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${factureAchat.fournisseur.telephone}`, 400, doc.y);
                doc.text(`Email: ${factureAchat.fournisseur.email}`, 400, doc.y);
                doc.moveDown();
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
                    doc.text(Number(article.prix_ttc).toFixed(2) + " €", tableLeft + 350, yPosition);
                    yPosition += rowHeight;
                });
                const bottomOfQuantityColumn = yPosition;
                doc.y = bottomOfQuantityColumn;
                doc.moveDown();
                doc.font("Helvetica-Bold");
                doc.text(`Total TTC: ${factureAchat.prix_total.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.moveDown();
                doc.text(`Montant réglé: ${factureAchat.montant_regle.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.moveDown();
                doc.text(`Solde dû: ${factureAchat.solde_du.toFixed(2)} €`, tableLeft + 315, doc.y, { align: "left" });
                doc.end();
            }
            catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la génération du PDF", error });
            }
        });
    }
}
exports.FactureAchatController = FactureAchatController;
function sanitizeFactureAchat(facture) {
    const { factureAchatDetails } = facture, sanitizedFacture = __rest(facture, ["factureAchatDetails"]);
    return Object.assign(Object.assign({}, sanitizedFacture), { factureAchatDetails: factureAchatDetails.map((detail) => ({
            id: detail.id,
            quantite: detail.quantite,
            article: detail.article,
        })) });
}
exports.factureAchatController = new FactureAchatController();
//# sourceMappingURL=FactureAchatController.js.map