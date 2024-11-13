import { DataSource } from "typeorm";
import dotenv from 'dotenv';

import "reflect-metadata";
import path from "path";
import { Stock } from "./entities/Stock";
import { Article } from "./entities/Article";
import { Famille } from "./entities/Famille";
import { Segmentation } from "./entities/Segmentation";
import { Client } from "./entities/Client";
import { MoyenPaiement } from "./entities/MoyenPaiement";
import { FactureArticle } from "./entities/FactureArticle";
import { Devis } from "./entities/Devis";
import { HistoriqueFacturation } from "./entities/HistoriqueFacturation";
import { Fournisseur } from "./entities/Fournisseur";
import { FactureAchat } from "./entities/FactureAchat";
import { HistoriqueFacturationAchat } from "./entities/HistoriqueFacturationAchat";
import { Commande } from "./entities/Commande";
import { Machine } from "./entities/Machine";
import { Vendeur } from "./entities/Vendeur";
import { PriseEnCharge } from "./entities/PriseEnCharge";
import { ServiceApresVente } from "./entities/ServiceApresVente";
import { Ticket } from "./entities/Ticket";
import { User } from "./entities/User";
import { DevisArticle } from "./entities/DevisArticle";
import { FactureArticleDetail } from "./entities/FactureArticleDetail";
import { CommandeArticle } from "./entities/CommandeArticle";
import { FactureAchatDetail } from "./entities/FactureAchatDetail";
import { PriseEnChargeArticle } from "./entities/PriseEnChargeArticle";
import { Sousfamille } from "./entities/Sousfamille";

dotenv.config();

const { DATABASE_URL } = process.env;

export const AppDataSource = new DataSource({
  type: "postgres",
  url: "postgresql://postgres:VLCfPengmpwglLhUJxNarrqHzkZdcvbd@autorack.proxy.rlwy.net:58904/railway",
  synchronize: false,
  logging: false,
  entities: [
    Stock,
    Article,
    Famille,
    Segmentation,
    Client,
    MoyenPaiement,
    FactureArticle,
    Devis,
    HistoriqueFacturation,
    Fournisseur,
    FactureAchat,
    HistoriqueFacturationAchat,
    Commande,
    Machine,
    Vendeur,
    PriseEnCharge,
    ServiceApresVente,
    Ticket,
    User,
    DevisArticle,
    FactureArticleDetail,
    CommandeArticle,
    FactureAchatDetail,
    PriseEnChargeArticle,
    Sousfamille,
  ],
  migrations: [path.join(__dirname, "/migration/*.ts")],
  subscribers: [path.join(__dirname, "/subscriber/**/*.ts")],
});
export const initializeDataSource = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Data Source has been initialized!");
  } catch (err) {
    console.error("Error during Data Source initialization:", err);
    throw err;
  }
};
