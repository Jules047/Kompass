import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { HistoriqueFacturationAchat } from "../entities/HistoriqueFacturationAchat";
import { Fournisseur } from "../entities/Fournisseur";
import { FactureAchat } from "../entities/FactureAchat";
import { Article } from "../entities/Article";
import { MoyenPaiement } from "../entities/MoyenPaiement";

export class HistoriqueFacturationAchatController {
  private historiqueRepository = AppDataSource.getRepository(HistoriqueFacturationAchat);
  private fournisseurRepository = AppDataSource.getRepository(Fournisseur);
  private factureAchatRepository = AppDataSource.getRepository(FactureAchat);
  private articleRepository = AppDataSource.getRepository(Article);
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);

  async getAllHistorique(request: Request, response: Response) {
    try {
      const historique = await this.historiqueRepository.find({
        relations: ["factureAchat", "fournisseur", "article", "factureAchat.moyenPaiement"]
      });

      const formattedHistorique = historique.map(entry => ({
        ...entry,
        montant_regle: entry.factureAchat.montant_regle,
        solde_du: entry.factureAchat.solde_du,
        moyens_paiement_id: entry.factureAchat.moyens_paiement_id
      }));

      const fournisseurs = await this.fournisseurRepository.find();
      const facturesAchat = await this.factureAchatRepository.find();
      const articles = await this.articleRepository.find();
      const moyensPaiement = await this.moyenPaiementRepository.find();

      response.json({
        historique: formattedHistorique,
        fournisseurs,
        facturesAchat,
        articles,
        moyensPaiement
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      response.status(500).json({ message: "Erreur lors de la récupération de l'historique", error });
    }
  }

  async getHistoriqueById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const historique = await this.historiqueRepository.findOne({
        where: { id },
        relations: ["factureAchat", "fournisseur", "article", "factureAchat.moyenPaiement"]
      });
      if (historique) {
        const formattedHistorique = {
          ...historique,
          montant_regle: historique.factureAchat.montant_regle,
          solde_du: historique.factureAchat.solde_du,
          moyens_paiement_id: historique.factureAchat.moyens_paiement_id
        };
        response.json(formattedHistorique);
      } else {
        response.status(404).json({ message: "Entrée d'historique non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entrée d'historique:", error);
      response.status(500).json({ message: "Erreur lors de la récupération de l'entrée d'historique", error });
    }
  }
}
