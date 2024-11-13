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
exports.DevisController = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const data_source_1 = require("../data-source");
const Devis_1 = require("../entities/Devis");
const Client_1 = require("../entities/Client");
const Article_1 = require("../entities/Article");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
const DevisArticle_1 = require("../entities/DevisArticle");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, "..", "..", "uploads", "signatures");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `signature_${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
class DevisController {
    constructor() {
        this.devisRepository = data_source_1.AppDataSource.getRepository(Devis_1.Devis);
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
    }
    createDevis(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = request.body, { clients_id, articles, moyens_paiement_id, acompte } = _a, devisData = __rest(_a, ["clients_id", "articles", "moyens_paiement_id", "acompte"]);
                const client = yield this.clientRepository.findOne({
                    where: { id: clients_id },
                });
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({
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
                        const article = yield this.articleRepository.findOne({
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            return response.status(404).json({
                                message: `Article avec l'ID ${articleData.id} non trouvé`,
                            });
                        }
                        if (articleData.quantite > article.quantite) {
                            warnings.push(`La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`);
                        }
                        const articleTarif = Number(article.prix_ttc) * Number(articleData.quantite);
                        totalTarif += articleTarif;
                        const devisArticle = new DevisArticle_1.DevisArticle();
                        devisArticle.article = article;
                        devisArticle.quantite = articleData.quantite;
                        devisArticles.push(devisArticle);
                    }
                }
                else {
                    return response.status(400).json({
                        message: "Les articles doivent être fournis sous forme de tableau",
                    });
                }
                const acompteValue = Number(acompte) || 0;
                const reste_payer = Math.max(0, totalTarif - acompteValue);
                const nouveauDevis = new Devis_1.Devis();
                Object.assign(nouveauDevis, Object.assign(Object.assign({}, devisData), { clients_id,
                    moyens_paiement_id, tarif: totalTarif, acompte: acompteValue, reste_payer,
                    client,
                    devisArticles,
                    moyenPaiement }));
                const devisSauvegarde = yield this.devisRepository.save(nouveauDevis);
                const devisComplet = yield this.devisRepository.findOne({
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
                }
                else {
                    return response.status(404).json({
                        message: "Devis créé mais non trouvé lors de la récupération",
                    });
                }
            }
            catch (error) {
                console.error("Erreur lors de la création du devis:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la création du devis", error });
            }
        });
    }
    updateDevis(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const devis = yield this.devisRepository.findOne({
                    where: { id },
                    relations: ["devisArticles", "devisArticles.article"],
                });
                if (!devis) {
                    return response.status(404).json({ message: "Devis non trouvé" });
                }
                const _a = request.body, { acompte, articles } = _a, updateData = __rest(_a, ["acompte", "articles"]);
                let totalTarif = 0;
                let newDevisArticles = [];
                let warnings = [];
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
                        const devisArticle = new DevisArticle_1.DevisArticle();
                        devisArticle.article = article;
                        devisArticle.quantite = articleData.quantite;
                        devisArticle.devis = devis;
                        newDevisArticles.push(devisArticle);
                        if (articleData.quantite > article.quantite) {
                            warnings.push(`La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`);
                        }
                        const articleTarif = Number(article.prix_ttc) * Number(articleData.quantite);
                        totalTarif += articleTarif;
                    }
                }
                else {
                    return response.status(400).json({
                        message: "Les articles doivent être fournis sous forme de tableau",
                    });
                }
                const acompteValue = Number(acompte) || 0;
                const reste_payer = Math.max(0, totalTarif - acompteValue);
                yield this.devisRepository
                    .createQueryBuilder()
                    .relation(Devis_1.Devis, "devisArticles")
                    .of(devis)
                    .remove(devis.devisArticles);
                Object.assign(devis, Object.assign(Object.assign({}, updateData), { tarif: totalTarif, acompte: acompteValue, reste_payer }));
                const updatedDevis = yield this.devisRepository.save(devis);
                updatedDevis.devisArticles = newDevisArticles;
                yield this.devisRepository.save(updatedDevis);
                const savedDevis = yield this.devisRepository.findOne({
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
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du devis:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la mise à jour du devis", error });
            }
        });
    }
    getAllDevis(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const devis = yield this.devisRepository.find({
                    relations: [
                        "client",
                        "devisArticles",
                        "devisArticles.article",
                        "moyenPaiement",
                    ],
                });
                response.json(devis);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des devis:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération des devis", error });
            }
        });
    }
    getDevisById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const devis = yield this.devisRepository.findOne({
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
                }
                else {
                    response.status(404).json({ message: "Devis non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du devis:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération du devis", error });
            }
        });
    }
    deleteDevis(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const devis = yield this.devisRepository.findOne({ where: { id } });
                if (!devis) {
                    return response.status(404).json({ message: "Devis non trouvé" });
                }
                if (devis.signature_path) {
                    fs_1.default.unlinkSync(devis.signature_path);
                }
                yield this.devisRepository.remove(devis);
                return response.json({ message: "Devis supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du devis:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la suppression du devis", error });
            }
        });
    }
    uploadSignature(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            upload.single("signature")(request, response, (err) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    return response.status(400).json({
                        message: "Erreur lors de l'upload de la signature",
                        error: err,
                    });
                }
                const id = parseInt(request.params.id);
                const devis = yield this.devisRepository.findOne({ where: { id } });
                if (!devis) {
                    return response.status(404).json({ message: "Devis non trouvé" });
                }
                if (devis.signature_path && fs_1.default.existsSync(devis.signature_path)) {
                    fs_1.default.unlinkSync(devis.signature_path);
                }
                if (request.file) {
                    devis.signature_path = request.file.path;
                    yield this.devisRepository.save(devis);
                    return response.json({ message: "Signature uploadée avec succès🥰", devis });
                }
                else {
                    return response.status(400).json({ message: "Aucun fichier n'a été uploadé" });
                }
            }));
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const devis = yield this.devisRepository.findOne({
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
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `Dev${String(devis.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, {
                    fit: [60, 100],
                });
                doc.moveDown();
                doc.fontSize(25).text("Devis", { align: "center" });
                doc.moveDown();
                doc.fontSize(12);
                const startY = doc.y;
                doc.text(`Numéro: Dev${String(devis.id).padStart(4, "0")}`);
                doc.text(`Date: ${new Date(devis.date).toLocaleDateString()}`);
                doc.text(`Moyen de paiement: ${devis.moyenPaiement.moyen}`);
                doc.moveDown();
                doc.text(`Commentaire: ${devis.commentaire}`);
                doc.fontSize(12);
                doc.text(`Client: ${devis.client.nom} ${devis.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${devis.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${devis.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${devis.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${devis.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${devis.client.email}`, 400, doc.y);
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
                devis.devisArticles.forEach((devisArticle) => {
                    const article = devisArticle.article;
                    doc.text(article.designation, tableLeft, yPosition);
                    doc.text(devisArticle.quantite.toString(), tableLeft + 250, yPosition);
                    const prix_ttc = typeof article.prix_ttc === "number"
                        ? article.prix_ttc
                        : parseFloat(article.prix_ttc);
                    doc.text((isNaN(prix_ttc) ? 0 : prix_ttc).toFixed(2) + " €", tableLeft + 350, yPosition);
                    yPosition += rowHeight;
                });
                const bottomOfQuantityColumn = yPosition;
                doc.y = bottomOfQuantityColumn;
                doc.moveDown();
                doc.font("Helvetica-Bold");
                doc.text(`Total: ${devis.tarif.toFixed(2)} €`, tableLeft + 315, doc.y, {
                    align: "left",
                });
                doc.text(`Acompte: ${devis.acompte.toFixed(2)} €`, tableLeft + 315, doc.y + rowHeight, {
                    align: "left",
                });
                doc.text(`Reste à payer: ${devis.reste_payer.toFixed(2)} €`, tableLeft + 315, doc.y + rowHeight, {
                    align: "left",
                });
                if (devis.signature_path && fs_1.default.existsSync(devis.signature_path)) {
                    const signatureImageSize = 100;
                    const pageWidth = doc.page.width;
                    const pageHeight = doc.page.height;
                    const margin = 50;
                    doc.text("Signature:", pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin - 20);
                    doc.image(devis.signature_path, pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin, {
                        fit: [signatureImageSize, signatureImageSize],
                    });
                }
                else {
                    doc.text("Signature: Non signé", {
                        align: "right",
                    });
                }
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
exports.DevisController = DevisController;
//# sourceMappingURL=DevisController.js.map