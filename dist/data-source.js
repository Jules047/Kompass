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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDataSource = exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
require("reflect-metadata");
const path_1 = __importDefault(require("path"));
const Stock_1 = require("./entities/Stock");
const Article_1 = require("./entities/Article");
const Famille_1 = require("./entities/Famille");
const Segmentation_1 = require("./entities/Segmentation");
const Client_1 = require("./entities/Client");
const MoyenPaiement_1 = require("./entities/MoyenPaiement");
const FactureArticle_1 = require("./entities/FactureArticle");
const Devis_1 = require("./entities/Devis");
const HistoriqueFacturation_1 = require("./entities/HistoriqueFacturation");
const Fournisseur_1 = require("./entities/Fournisseur");
const FactureAchat_1 = require("./entities/FactureAchat");
const HistoriqueFacturationAchat_1 = require("./entities/HistoriqueFacturationAchat");
const Commande_1 = require("./entities/Commande");
const Machine_1 = require("./entities/Machine");
const Vendeur_1 = require("./entities/Vendeur");
const PriseEnCharge_1 = require("./entities/PriseEnCharge");
const ServiceApresVente_1 = require("./entities/ServiceApresVente");
const Ticket_1 = require("./entities/Ticket");
const User_1 = require("./entities/User");
const DevisArticle_1 = require("./entities/DevisArticle");
const FactureArticleDetail_1 = require("./entities/FactureArticleDetail");
const CommandeArticle_1 = require("./entities/CommandeArticle");
const FactureAchatDetail_1 = require("./entities/FactureAchatDetail");
const PriseEnChargeArticle_1 = require("./entities/PriseEnChargeArticle");
const Sousfamille_1 = require("./entities/Sousfamille");
dotenv_1.default.config();
const { DATABASE_URL } = process.env;
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: "postgresql://postgres:VLCfPengmpwglLhUJxNarrqHzkZdcvbd@autorack.proxy.rlwy.net:58904/railway",
    ssl: {
        rejectUnauthorized: false
    },
    synchronize: false,
    logging: true,
    entities: [
        Stock_1.Stock,
        Article_1.Article,
        Famille_1.Famille,
        Segmentation_1.Segmentation,
        Client_1.Client,
        MoyenPaiement_1.MoyenPaiement,
        FactureArticle_1.FactureArticle,
        Devis_1.Devis,
        HistoriqueFacturation_1.HistoriqueFacturation,
        Fournisseur_1.Fournisseur,
        FactureAchat_1.FactureAchat,
        HistoriqueFacturationAchat_1.HistoriqueFacturationAchat,
        Commande_1.Commande,
        Machine_1.Machine,
        Vendeur_1.Vendeur,
        PriseEnCharge_1.PriseEnCharge,
        ServiceApresVente_1.ServiceApresVente,
        Ticket_1.Ticket,
        User_1.User,
        DevisArticle_1.DevisArticle,
        FactureArticleDetail_1.FactureArticleDetail,
        CommandeArticle_1.CommandeArticle,
        FactureAchatDetail_1.FactureAchatDetail,
        PriseEnChargeArticle_1.PriseEnChargeArticle,
        Sousfamille_1.Sousfamille,
    ],
    migrations: [path_1.default.join(__dirname, "/migration/*.ts")],
    subscribers: [path_1.default.join(__dirname, "/subscriber/**/*.ts")],
});
const initializeDataSource = () => __awaiter(void 0, void 0, void 0, function* () {
    let tentatives = 5;
    while (tentatives) {
        try {
            yield exports.AppDataSource.initialize();
            console.log("Base de données initialisée avec succès!");
            return;
        }
        catch (err) {
            console.error("Erreur d'initialisation:", err);
            tentatives -= 1;
            if (tentatives === 0) {
                throw new Error("Impossible de se connecter à la base de données après 5 tentatives");
            }
            console.log(`Nouvelle tentative dans 5 secondes... (${tentatives} restantes)`);
            yield new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
});
exports.initializeDataSource = initializeDataSource;
//# sourceMappingURL=data-source.js.map