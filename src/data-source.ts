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
  ssl: {
    rejectUnauthorized: false
  },
  synchronize: false,
  logging: true,
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
  let tentatives = 5;
  while (tentatives) {
    try {
      await AppDataSource.initialize();
      console.log("Base de données initialisée avec succès!");
      return;
    } catch (err) {
      console.error("Erreur d'initialisation:", err);
      tentatives -= 1;
      if (tentatives === 0) {
        throw new Error("Impossible de se connecter à la base de données après 5 tentatives");
      }
      console.log(`Nouvelle tentative dans 5 secondes... (${tentatives} restantes)`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};