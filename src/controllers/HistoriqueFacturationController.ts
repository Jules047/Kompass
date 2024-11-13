import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { HistoriqueFacturation } from "../entities/HistoriqueFacturation";

export class HistoriqueFacturationController {
  private historiqueRepository = AppDataSource.getRepository(
    HistoriqueFacturation
  );

  async getAllHistorique(request: Request, response: Response) {
    try {
      const historique = await this.historiqueRepository.find({
        relations: {
          client: true,
          factureArticle: true,
          devis: true,
          article: true,
        },
        order: {
          date_creation: "DESC",
        },
      });

      response.json({ historique });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération de l'historique" });
    }
  }
}
