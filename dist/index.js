"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const data_source_1 = require("./data-source");
const familleRoutes_1 = __importDefault(require("./routes/familleRoutes"));
const articleRoutes_1 = __importDefault(require("./routes/articleRoutes"));
const stockRoutes_1 = __importDefault(require("./routes/stockRoutes"));
const segmentationRoutes_1 = __importDefault(require("./routes/segmentationRoutes"));
const clientRoutes_1 = __importDefault(require("./routes/clientRoutes"));
const moyenPaiementRoutes_1 = __importDefault(require("./routes/moyenPaiementRoutes"));
const factureArticleRoutes_1 = __importDefault(require("./routes/factureArticleRoutes"));
const devisRoutes_1 = __importDefault(require("./routes/devisRoutes"));
const historiqueFacturationRoutes_1 = __importDefault(require("./routes/historiqueFacturationRoutes"));
const fournisseurRoutes_1 = __importDefault(require("./routes/fournisseurRoutes"));
const factureAchatRoutes_1 = __importDefault(require("./routes/factureAchatRoutes"));
const historiqueFacturationAchatRoutes_1 = __importDefault(require("./routes/historiqueFacturationAchatRoutes"));
const commandeRoutes_1 = __importDefault(require("./routes/commandeRoutes"));
const machineRoutes_1 = __importDefault(require("./routes/machineRoutes"));
const vendeurRoutes_1 = __importDefault(require("./routes/vendeurRoutes"));
const priseEnChargeRoutes_1 = __importDefault(require("./routes/priseEnChargeRoutes"));
const serviceApresVenteRoutes_1 = __importDefault(require("./routes/serviceApresVenteRoutes"));
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const sousfamilleRoutes_1 = __importDefault(require("./routes/sousfamilleRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log('Connexion à la base de données établie avec succès!');
    app.use('/api', familleRoutes_1.default);
    app.use('/api', articleRoutes_1.default);
    app.use('/api', stockRoutes_1.default);
    app.use('/api', segmentationRoutes_1.default);
    app.use('/api', clientRoutes_1.default);
    app.use('/api', moyenPaiementRoutes_1.default);
    app.use('/api', factureArticleRoutes_1.default);
    app.use('/api/devis', devisRoutes_1.default);
    app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
    app.use('/api/historique-facturation', historiqueFacturationRoutes_1.default);
    app.use('/api/fournisseurs', fournisseurRoutes_1.default);
    app.use('/api/factures-achat', factureAchatRoutes_1.default);
    app.use('/api/historique-facturation-achat', historiqueFacturationAchatRoutes_1.default);
    app.use('/api', commandeRoutes_1.default);
    app.use('/api', machineRoutes_1.default);
    app.use('/api', vendeurRoutes_1.default);
    app.use('/api', priseEnChargeRoutes_1.default);
    app.use('/api', serviceApresVenteRoutes_1.default);
    app.use('/api', ticketRoutes_1.default);
    app.use("/api/auth", authRoutes_1.default);
    app.use("/users", userRoutes_1.default);
    app.use("/api", sousfamilleRoutes_1.default);
    app.listen(port, () => {
        console.log(`Serveur démarré sur le port ${port}`);
    });
})
    .catch((error) => {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map