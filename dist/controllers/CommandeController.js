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
exports.CommandeController = void 0;
const data_source_1 = require("../data-source");
const Commande_1 = require("../entities/Commande");
const Article_1 = require("../entities/Article");
const Stock_1 = require("../entities/Stock");
const Client_1 = require("../entities/Client");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
const CommandeArticle_1 = require("../entities/CommandeArticle");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const StockController_1 = require("./StockController");
function cleanCircularReferences(obj, seen = new WeakSet()) {
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    if (seen.has(obj)) {
        return "[Circular Reference]";
    }
    seen.add(obj);
    const cleanObj = Array.isArray(obj) ? [] : {};
    for (const [key, value] of Object.entries(obj)) {
        if (key === "commande" && typeof value === "object") {
            cleanObj[key] = "[Commande Reference]";
        }
        else {
            cleanObj[key] = cleanCircularReferences(value, seen);
        }
    }
    return cleanObj;
}
const uploadDir = path_1.default.join(__dirname, "..", "..", "uploads", "signatures");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `signature_commande_${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
class CommandeController {
    constructor() {
        this.commandeRepository = data_source_1.AppDataSource.getRepository(Commande_1.Commande);
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
        this.stockController = new StockController_1.StockController();
    }
    creerCommande(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            try {
                yield queryRunner.connect();
                yield queryRunner.startTransaction();
                const _a = request.body, { clients_id, articles, moyens_paiement_id, acompte } = _a, commandeData = __rest(_a, ["clients_id", "articles", "moyens_paiement_id", "acompte"]);
                const client = yield queryRunner.manager.findOne(Client_1.Client, {
                    where: { id: clients_id },
                });
                const moyenPaiement = yield queryRunner.manager.findOne(MoyenPaiement_1.MoyenPaiement, {
                    where: { id: moyens_paiement_id },
                });
                if (!client || !moyenPaiement) {
                    throw new Error("Client ou Moyen de paiement non trouvé");
                }
                let totalTarif = 0;
                const warnings = [];
                const nouvelleCommande = new Commande_1.Commande();
                Object.assign(nouvelleCommande, Object.assign(Object.assign({}, commandeData), { client,
                    moyenPaiement, date_creation: new Date() }));
                const commandeArticles = [];
                for (const articleData of articles) {
                    const article = yield queryRunner.manager.findOne(Article_1.Article, {
                        where: { id: articleData.id },
                    });
                    if (!article) {
                        throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
                    }
                    if (articleData.quantite > article.quantite) {
                        warnings.push(`La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`);
                    }
                    const commandeArticle = new CommandeArticle_1.CommandeArticle();
                    commandeArticle.article = article;
                    commandeArticle.quantite = articleData.quantite;
                    commandeArticle.commande = nouvelleCommande;
                    const prixArticle = Number(article.prix_ttc) * articleData.quantite;
                    totalTarif += prixArticle;
                    commandeArticles.push(commandeArticle);
                    console.log(`Article ajouté: ${article.designation}, Prix: ${prixArticle}, Total actuel: ${totalTarif}`);
                }
                const acompteValue = Number(acompte) || 0;
                const reste_payer = Math.max(0, totalTarif - acompteValue);
                nouvelleCommande.tarif = totalTarif;
                nouvelleCommande.acompte = acompteValue;
                nouvelleCommande.reste_payer = reste_payer;
                nouvelleCommande.commandeArticles = commandeArticles;
                console.log("Nouvelle commande avant sauvegarde:", JSON.stringify(cleanCircularReferences(nouvelleCommande), null, 2));
                let commandeSauvegardee = yield queryRunner.manager.save(Commande_1.Commande, nouvelleCommande);
                yield queryRunner.query("SELECT update_stock_from_commande($1)", [
                    commandeSauvegardee.id,
                ]);
                console.log("Commande sauvegardée:", JSON.stringify(cleanCircularReferences(commandeSauvegardee), null, 2));
                yield queryRunner.manager.update(Commande_1.Commande, commandeSauvegardee.id, {
                    tarif: totalTarif,
                    acompte: acompteValue,
                    reste_payer: reste_payer,
                });
                yield queryRunner.manager.save(CommandeArticle_1.CommandeArticle, commandeArticles);
                yield queryRunner.commitTransaction();
                const commandeComplete = yield queryRunner.manager.findOne(Commande_1.Commande, {
                    where: { id: commandeSauvegardee.id },
                    relations: [
                        "client",
                        "commandeArticles",
                        "commandeArticles.article",
                        "moyenPaiement",
                    ],
                });
                console.log("Commande complète après récupération:", JSON.stringify(cleanCircularReferences(commandeComplete), null, 2));
                if (commandeComplete) {
                    response.json({
                        message: "Commande créée et mise à jour",
                        commande: commandeComplete,
                        warnings,
                        needsRefresh: true,
                    });
                }
                else {
                    throw new Error("Commande créée mais non trouvée lors de la récupération finale");
                }
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la création de la commande:", error);
                response.status(500).json({
                    message: "Erreur lors de la création de la commande",
                    error: error.message,
                    needsRefresh: false,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    mettreAJourCommande(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            try {
                yield queryRunner.connect();
                yield queryRunner.startTransaction();
                const id = parseInt(request.params.id);
                const _a = request.body, { acompte, articles } = _a, updateData = __rest(_a, ["acompte", "articles"]);
                let commande = yield queryRunner.manager.findOne(Commande_1.Commande, {
                    where: { id },
                    relations: ["commandeArticles", "commandeArticles.article"],
                });
                if (!commande) {
                    throw new Error("Commande non trouvée");
                }
                let totalTarif = 0;
                const warnings = [];
                yield queryRunner.manager.remove(commande.commandeArticles);
                const newCommandeArticles = yield Promise.all(articles.map((articleData) => __awaiter(this, void 0, void 0, function* () {
                    const article = yield queryRunner.manager.findOne(Article_1.Article, {
                        where: { id: articleData.id },
                    });
                    if (!article) {
                        throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
                    }
                    const commandeArticle = new CommandeArticle_1.CommandeArticle();
                    if (commande) {
                        commandeArticle.commande = commande;
                    }
                    else {
                        throw new Error("Commande non trouvée");
                    }
                    commandeArticle.article = article;
                    commandeArticle.quantite = articleData.quantite;
                    if (articleData.quantite > article.quantite) {
                        warnings.push(`La quantité demandée pour l'article ${article.designation} dépasse le stock disponible.`);
                    }
                    totalTarif += Number(article.prix_ttc) * articleData.quantite;
                    return commandeArticle;
                })));
                const acompteValue = Number(acompte) || 0;
                const reste_payer = Math.max(0, totalTarif - acompteValue);
                Object.assign(commande, Object.assign(Object.assign({}, updateData), { tarif: totalTarif, acompte: acompteValue, reste_payer, commandeArticles: newCommandeArticles }));
                commande = yield queryRunner.manager.save(Commande_1.Commande, commande);
                yield queryRunner.query("SELECT update_stock_from_commande($1)", [
                    commande.id,
                ]);
                yield queryRunner.commitTransaction();
                const savedCommande = yield queryRunner.manager.findOne(Commande_1.Commande, {
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
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la mise à jour de la commande:", error);
                response.status(500).json({
                    message: "Erreur lors de la mise à jour de la commande",
                    error: error.message,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    obtenirToutesLesCommandes(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commandes = yield this.commandeRepository.find({
                    where: { annulee: false },
                    relations: [
                        "client",
                        "commandeArticles",
                        "commandeArticles.article",
                        "moyenPaiement",
                    ],
                });
                response.json(commandes);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des commandes:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération des commandes",
                    error,
                });
            }
        });
    }
    obtenirCommandeParId(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const commande = yield this.commandeRepository.findOne({
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
                }
                else {
                    response.status(404).json({ message: "Commande non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de la commande:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération de la commande",
                    error,
                });
            }
        });
    }
    supprimerCommande(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const commande = yield queryRunner.manager.findOne(Commande_1.Commande, {
                    where: { id },
                    relations: ["commandeArticles", "commandeArticles.article"],
                });
                if (!commande) {
                    yield queryRunner.rollbackTransaction();
                    response.status(404).json({ message: "Commande non trouvée" });
                    return;
                }
                yield queryRunner.query(`DELETE FROM stocks WHERE commande_id = $1`, [
                    id,
                ]);
                yield queryRunner.manager.delete(CommandeArticle_1.CommandeArticle, { commande: { id } });
                if (commande.signature_path && fs_1.default.existsSync(commande.signature_path)) {
                    fs_1.default.unlinkSync(commande.signature_path);
                }
                yield queryRunner.manager.remove(Commande_1.Commande, commande);
                yield queryRunner.commitTransaction();
                response.json({
                    message: "Commande supprimée avec succès",
                    success: true,
                });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la suppression de la commande:", error);
                response.status(500).json({
                    message: "Erreur lors de la suppression de la commande",
                    error,
                    success: false,
                });
            }
            finally {
                yield queryRunner.release();
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
                const commande = yield this.commandeRepository.findOne({
                    where: { id },
                });
                if (!commande) {
                    return response.status(404).json({ message: "Commande non trouvée" });
                }
                if (commande.signature_path && fs_1.default.existsSync(commande.signature_path)) {
                    fs_1.default.unlinkSync(commande.signature_path);
                }
                if (request.file) {
                    commande.signature_path = request.file.path;
                    yield this.commandeRepository.save(commande);
                    return response.json({
                        message: "Signature uploadée avec succès🥰",
                        commande,
                    });
                }
                else {
                    return response
                        .status(400)
                        .json({ message: "Aucun fichier n'a été uploadé" });
                }
            }));
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const commande = yield this.commandeRepository.findOne({
                    where: { id },
                    relations: [
                        "client",
                        "commandeArticles",
                        "commandeArticles.article",
                        "moyenPaiement",
                    ],
                });
                if (!commande) {
                    response.status(404).json({ message: "Commande non trouvée" });
                    return;
                }
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `Com${String(commande.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, {
                    fit: [60, 100],
                });
                doc.moveDown();
                doc.fontSize(25).text("Commande", { align: "center" });
                doc.moveDown();
                doc.fontSize(12);
                const startY = doc.y;
                doc.text(`Numéro: Com${String(commande.id).padStart(4, "0")}`);
                doc.text(`Date: ${new Date(commande.date_creation).toLocaleDateString()}`);
                doc.text(`Moyen de paiement: ${commande.moyenPaiement.moyen}`);
                doc.moveDown();
                doc.text(`Commentaire: ${commande.commentaire || "Aucun commentaire"}`);
                doc.fontSize(12);
                doc.text(`Client: ${commande.client.nom} ${commande.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${commande.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${commande.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${commande.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${commande.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${commande.client.email}`, 400, doc.y);
                doc.moveDown();
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
                    doc.text((Number(article.prix_ttc) * detail.quantite).toFixed(2) + " €", tableLeft + 350, yPosition);
                    yPosition += rowHeight;
                });
                const bottomOfQuantityColumn = yPosition;
                doc.y = bottomOfQuantityColumn;
                doc.moveDown();
                doc.font("Helvetica-Bold");
                doc.text(`Total: ${commande.tarif.toFixed(2)} €`, tableLeft + 315, doc.y, {
                    align: "left",
                });
                doc.text(`Acompte: ${commande.acompte.toFixed(2)} €`, tableLeft + 315, doc.y + 20, {
                    align: "left",
                });
                doc.text(`Reste à payer: ${commande.reste_payer.toFixed(2)} €`, tableLeft + 315, doc.y + 40, {
                    align: "left",
                });
                if (commande.signature_path && fs_1.default.existsSync(commande.signature_path)) {
                    const signatureImageSize = 100;
                    const pageWidth = doc.page.width;
                    const pageHeight = doc.page.height;
                    const margin = 50;
                    doc.text("Signature:", pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin - 20);
                    doc.image(commande.signature_path, pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin, {
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
                response.status(500).json({
                    message: "Erreur lors de la génération du PDF",
                    error
                });
            }
        });
    }
    annulerCommande(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const commande = yield queryRunner.manager.findOne(Commande_1.Commande, {
                    where: { id },
                    relations: ["commandeArticles", "commandeArticles.article"],
                });
                if (!commande) {
                    yield queryRunner.rollbackTransaction();
                    return response.status(404).json({ message: "Commande non trouvée" });
                }
                commande.annulee = true;
                commande.date_annulation = new Date();
                for (const commandeArticle of commande.commandeArticles) {
                    const stockEntree = queryRunner.manager.create(Stock_1.Stock, {
                        articles_id: commandeArticle.article.id,
                        entree: commandeArticle.quantite,
                        sortie: 0,
                        date_entree: new Date(),
                    });
                    yield queryRunner.manager.save(stockEntree);
                    commandeArticle.article.quantite += commandeArticle.quantite;
                    yield queryRunner.manager.save(commandeArticle.article);
                }
                yield queryRunner.manager.save(commande);
                yield queryRunner.commitTransaction();
                return response.json({
                    message: "Commande annulée et stock mis à jour",
                    commande,
                });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de l'annulation de la commande:", error);
                return response.status(500).json({
                    message: "Erreur lors de l'annulation de la commande",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    obtenirCommandesAnnulees(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const commandesAnnulees = yield this.commandeRepository.find({
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
            }
            catch (error) {
                console.error("Erreur lors de la récupération des commandes annulées:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération des commandes annulées",
                    error: error.message,
                });
            }
        });
    }
    restaurerCommande(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const commande = yield this.commandeRepository.findOne({
                    where: { id },
                    relations: ["commandeArticles", "commandeArticles.article"],
                });
                if (!commande) {
                    yield queryRunner.rollbackTransaction();
                    return response.status(404).json({ message: "Commande non trouvée" });
                }
                commande.annulee = false;
                commande.date_annulation = null;
                for (const commandeArticle of commande.commandeArticles) {
                    const stockSortie = queryRunner.manager.create(Stock_1.Stock, {
                        articles_id: commandeArticle.article.id,
                        entree: 0,
                        sortie: commandeArticle.quantite,
                        date_sortie: new Date(),
                    });
                    yield queryRunner.manager.save(stockSortie);
                    commandeArticle.article.quantite -= commandeArticle.quantite;
                    yield queryRunner.manager.save(commandeArticle.article);
                }
                yield queryRunner.manager.save(commande);
                yield queryRunner.commitTransaction();
                return response.json({ message: "Commande restaurée", commande });
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la restauration de la commande:", error);
                return response.status(500).json({
                    message: "Erreur lors de la restauration de la commande",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    mettreAJourDescription(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const { description } = request.body;
                console.log("Description reçue:", description);
                const commande = yield this.commandeRepository.findOne({
                    where: { id },
                });
                if (!commande) {
                    return response.status(404).json({ message: "Commande non trouvée" });
                }
                commande.commentaire = description;
                yield this.commandeRepository.save(commande);
                return response.json({ message: "Description mise à jour", commande });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour de la description:", error);
                return response.status(500).json({
                    message: "Erreur lors de la mise à jour de la description",
                    error,
                });
            }
        });
    }
}
exports.CommandeController = CommandeController;
//# sourceMappingURL=CommandeController.js.map