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
exports.PriseEnChargeController = void 0;
const data_source_1 = require("../data-source");
const PriseEnCharge_1 = require("../entities/PriseEnCharge");
const Client_1 = require("../entities/Client");
const Article_1 = require("../entities/Article");
const Machine_1 = require("../entities/Machine");
const Vendeur_1 = require("../entities/Vendeur");
const PriseEnChargeArticle_1 = require("../entities/PriseEnChargeArticle");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
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
class PriseEnChargeController {
    constructor() {
        this.priseEnChargeRepository = data_source_1.AppDataSource.getRepository(PriseEnCharge_1.PriseEnCharge);
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.machineRepository = data_source_1.AppDataSource.getRepository(Machine_1.Machine);
        this.vendeurRepository = data_source_1.AppDataSource.getRepository(Vendeur_1.Vendeur);
    }
    createPriseEnCharge(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            let transactionStarted = false;
            try {
                yield queryRunner.connect();
                yield queryRunner.startTransaction();
                transactionStarted = true;
                const _a = request.body, { clients_id, articles, machines_id, vendeurs_id } = _a, priseEnChargeData = __rest(_a, ["clients_id", "articles", "machines_id", "vendeurs_id"]);
                const client = yield queryRunner.manager.findOne(Client_1.Client, {
                    where: { id: clients_id },
                });
                const machine = yield queryRunner.manager.findOne(Machine_1.Machine, {
                    where: { id: machines_id },
                });
                const vendeur = yield queryRunner.manager.findOne(Vendeur_1.Vendeur, {
                    where: { id: vendeurs_id },
                });
                if (!client || !machine || !vendeur) {
                    throw new Error("Client, Machine ou Vendeur non trouvé");
                }
                const nouvellePriseEnCharge = new PriseEnCharge_1.PriseEnCharge();
                Object.assign(nouvellePriseEnCharge, Object.assign(Object.assign({}, priseEnChargeData), { client,
                    machine,
                    vendeur, date: new Date() }));
                const priseEnChargeSauvegardee = yield queryRunner.manager.save(PriseEnCharge_1.PriseEnCharge, nouvellePriseEnCharge);
                if (Array.isArray(articles)) {
                    for (let articleData of articles) {
                        const article = yield queryRunner.manager.findOne(Article_1.Article, {
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            throw new Error(`Article avec l'ID ${articleData.id} non trouvé`);
                        }
                        const priseEnChargeArticle = new PriseEnChargeArticle_1.PriseEnChargeArticle();
                        priseEnChargeArticle.article = article;
                        priseEnChargeArticle.quantite = articleData.quantite;
                        priseEnChargeArticle.priseEnCharge = priseEnChargeSauvegardee;
                        yield queryRunner.manager.save(PriseEnChargeArticle_1.PriseEnChargeArticle, priseEnChargeArticle);
                    }
                }
                yield queryRunner.commitTransaction();
                const priseEnChargeComplete = yield this.priseEnChargeRepository.findOne({
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
                }
                else {
                    throw new Error("Prise en charge créée mais non trouvée lors de la récupération");
                }
            }
            catch (error) {
                console.error("Erreur lors de la création de la prise en charge:", error);
                if (transactionStarted && queryRunner.isTransactionActive) {
                    yield queryRunner.rollbackTransaction();
                }
                response.status(500).json({
                    message: "Erreur lors de la création de la prise en charge",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    getAllPrisesEnCharge(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prisesEnCharge = yield this.priseEnChargeRepository
                    .createQueryBuilder("priseEnCharge")
                    .leftJoinAndSelect("priseEnCharge.client", "client")
                    .leftJoinAndSelect("priseEnCharge.priseEnChargeArticles", "priseEnChargeArticles")
                    .leftJoinAndSelect("priseEnChargeArticles.article", "article")
                    .leftJoinAndSelect("priseEnCharge.machine", "machine")
                    .leftJoinAndSelect("priseEnCharge.vendeur", "vendeur")
                    .orderBy("priseEnCharge.date", "DESC")
                    .getMany();
                const formattedPrisesEnCharge = prisesEnCharge.map((pec) => (Object.assign(Object.assign({}, pec), { formattedId: `PEC${pec.id.toString().padStart(4, "0")}` })));
                response.json(formattedPrisesEnCharge);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des prises en charge:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération des prises en charge",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        });
    }
    getPriseEnChargeById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const priseEnCharge = yield this.priseEnChargeRepository.findOne({
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
                }
                else {
                    response.status(404).json({ message: "Prise en charge non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de la prise en charge:", error);
                response.status(500).json({
                    message: "Erreur lors de la récupération de la prise en charge",
                    error,
                });
            }
        });
    }
    updatePriseEnCharge(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            let transactionStarted = false;
            try {
                yield queryRunner.connect();
                yield queryRunner.startTransaction();
                transactionStarted = true;
                const id = parseInt(request.params.id);
                const _a = request.body, { articles } = _a, priseEnChargeData = __rest(_a, ["articles"]);
                let priseEnCharge = yield queryRunner.manager.findOne(PriseEnCharge_1.PriseEnCharge, {
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
                Object.assign(priseEnCharge, priseEnChargeData);
                priseEnCharge = yield queryRunner.manager.save(PriseEnCharge_1.PriseEnCharge, priseEnCharge);
                if (Array.isArray(articles)) {
                    yield queryRunner.manager.delete(PriseEnChargeArticle_1.PriseEnChargeArticle, {
                        prise_en_charge_id: priseEnCharge.id,
                    });
                    for (const articleData of articles) {
                        const article = yield queryRunner.manager.findOne(Article_1.Article, {
                            where: { id: articleData.id },
                        });
                        if (!article) {
                            throw new Error(`Article with id ${articleData.id} not found`);
                        }
                        const newPriseEnChargeArticle = new PriseEnChargeArticle_1.PriseEnChargeArticle();
                        newPriseEnChargeArticle.article = article;
                        newPriseEnChargeArticle.article_id = article.id;
                        newPriseEnChargeArticle.quantite = articleData.quantite;
                        newPriseEnChargeArticle.priseEnCharge = priseEnCharge;
                        newPriseEnChargeArticle.prise_en_charge_id = priseEnCharge.id;
                        yield queryRunner.manager.save(PriseEnChargeArticle_1.PriseEnChargeArticle, newPriseEnChargeArticle);
                    }
                }
                yield queryRunner.commitTransaction();
                const updatedPriseEnCharge = yield this.priseEnChargeRepository.findOne({
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
            }
            catch (error) {
                console.error("Error updating prise en charge:", error);
                if (transactionStarted && queryRunner.isTransactionActive) {
                    yield queryRunner.rollbackTransaction();
                }
                response.status(500).json({
                    message: "Erreur lors de la mise à jour de la prise en charge",
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    deletePriseEnCharge(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const priseEnCharge = yield this.priseEnChargeRepository.findOne({
                    where: { id },
                    relations: ["priseEnChargeArticles"],
                });
                if (!priseEnCharge) {
                    response
                        .status(404)
                        .json({ message: "Prise en charge non trouvée" });
                    return;
                }
                yield this.priseEnChargeRepository.remove(priseEnCharge);
                response.json({ message: "Prise en charge supprimée" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression de la prise en charge:", error);
                response.status(500).json({
                    message: "Erreur lors de la suppression de la prise en charge",
                    error,
                });
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
                const priseEnCharge = yield this.priseEnChargeRepository.findOne({
                    where: { id },
                });
                if (!priseEnCharge) {
                    return response
                        .status(404)
                        .json({ message: "Prise en charge non trouvée" });
                }
                if (priseEnCharge.signature_path &&
                    fs_1.default.existsSync(priseEnCharge.signature_path)) {
                    fs_1.default.unlinkSync(priseEnCharge.signature_path);
                }
                if (request.file) {
                    priseEnCharge.signature_path = request.file.path;
                    yield this.priseEnChargeRepository.save(priseEnCharge);
                    return response.json({
                        message: "Signature uploadée avec succès🥰",
                        priseEnCharge,
                    });
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
                const priseEnCharge = yield this.priseEnChargeRepository.findOne({
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
                    response
                        .status(404)
                        .json({ message: "Prise en charge non trouvée" });
                    return;
                }
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `PEC${String(priseEnCharge.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, {
                    fit: [60, 100],
                });
                doc.moveDown();
                doc.fontSize(25).text("Prise en Charge", { align: "center" });
                doc.moveDown();
                doc.fontSize(12);
                const startY = doc.y;
                doc.text(`Numéro: PEC${String(priseEnCharge.id).padStart(4, "0")}`);
                doc.text(`Date: ${new Date(priseEnCharge.date).toLocaleDateString()}`);
                doc.text(`Statut: ${priseEnCharge.statut === "Pret" ? "Prêt" : priseEnCharge.statut}`);
                doc.moveDown();
                doc.text(`Machine: ${priseEnCharge.machine.label} ${priseEnCharge.machine.marque} (${priseEnCharge.machine.couleur})`);
                doc.text(`Vendeur: ${priseEnCharge.vendeur.nom} ${priseEnCharge.vendeur.prenom}`);
                doc.moveDown();
                doc.text(`Symptôme: ${priseEnCharge.symptome}`);
                doc.text(`Mot de passe Windows: ${priseEnCharge.mot_de_passe_windows || "Non fourni"}`);
                doc.text(`Batterie: ${priseEnCharge.batterie || "Non spécifié"}`);
                doc.text(`Chargeur: ${priseEnCharge.chargeur || "Non spécifié"}`);
                doc.text(`Accessoire: ${priseEnCharge.accessoire || "Pas d'accessoire"}`);
                doc.fontSize(12);
                doc.text(`Client: ${priseEnCharge.client.nom} ${priseEnCharge.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${priseEnCharge.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${priseEnCharge.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${priseEnCharge.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${priseEnCharge.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${priseEnCharge.client.email}`, 400, doc.y);
                doc.moveDown();
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
                    const prix_ttc = typeof article.prix_ttc === "number"
                        ? article.prix_ttc
                        : parseFloat(article.prix_ttc);
                    doc.text((isNaN(prix_ttc) ? 0 : prix_ttc).toFixed(2) + " €", tableLeft + 350, yPosition);
                    yPosition += rowHeight;
                });
                const total = priseEnCharge.priseEnChargeArticles.reduce((acc, detail) => {
                    const prix_ttc = typeof detail.article.prix_ttc === "number"
                        ? detail.article.prix_ttc
                        : parseFloat(detail.article.prix_ttc);
                    return acc + prix_ttc * detail.quantite;
                }, 0);
                const bottomOfQuantityColumn = yPosition;
                doc.y = bottomOfQuantityColumn;
                doc.moveDown();
                doc.font("Helvetica-Bold");
                doc.text(`Total: ${total.toFixed(2)} €`, tableLeft + 315, doc.y, {
                    align: "left",
                });
                if (priseEnCharge.signature_path &&
                    fs_1.default.existsSync(priseEnCharge.signature_path)) {
                    const signatureImageSize = 100;
                    const pageWidth = doc.page.width;
                    const pageHeight = doc.page.height;
                    const margin = 50;
                    doc.text("Signature:", pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin - 20);
                    doc.image(priseEnCharge.signature_path, pageWidth - signatureImageSize - margin, pageHeight - signatureImageSize - margin, {
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
                response
                    .status(500)
                    .json({ message: "Erreur lors de la génération du PDF", error });
            }
        });
    }
}
exports.PriseEnChargeController = PriseEnChargeController;
function sanitizePriseEnCharge(priseEnCharge) {
    const { priseEnChargeArticles } = priseEnCharge, sanitizedPriseEnCharge = __rest(priseEnCharge, ["priseEnChargeArticles"]);
    return Object.assign(Object.assign({}, sanitizedPriseEnCharge), { priseEnChargeArticles: priseEnChargeArticles.map((detail) => ({
            id: detail.id,
            quantite: detail.quantite,
            article: detail.article,
        })) });
}
//# sourceMappingURL=PriseEnChargeController.js.map