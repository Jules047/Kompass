import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { MoyenPaiement } from "../entities/MoyenPaiement";

export class MoyenPaiementController {
  private moyenPaiementRepository = AppDataSource.getRepository(MoyenPaiement);

  async createMoyenPaiement(request: Request, response: Response) {
    try {
      const { moyen } = request.body;
      const moyenPaiement = this.moyenPaiementRepository.create({ moyen });
      await this.moyenPaiementRepository.save(moyenPaiement);
      response.json({ message: "Moyen de paiement créé", moyenPaiement });
    } catch (error) {
      console.error("Erreur lors de la création du moyen de paiement:", error);
      response.status(500).json({ message: "Erreur lors de la création du moyen de paiement", error });
    }
  }

  async getAllMoyensPaiement(request: Request, response: Response) {
    try {
      const moyensPaiement = await this.moyenPaiementRepository.find();
      response.json(moyensPaiement);
    } catch (error) {
      console.error("Erreur lors de la récupération des moyens de paiement:", error);
      response.status(500).json({ message: "Erreur lors de la récupération des moyens de paiement", error });
    }
  }

  async getMoyenPaiementById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const moyenPaiement = await this.moyenPaiementRepository.findOne({ where: { id } });
      if (moyenPaiement) {
        response.json(moyenPaiement);
      } else {
        response.status(404).json({ message: "Moyen de paiement non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du moyen de paiement:", error);
      response.status(500).json({ message: "Erreur lors de la récupération du moyen de paiement", error });
    }
  }

  async updateMoyenPaiement(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const moyenPaiement = await this.moyenPaiementRepository.findOne({ where: { id } });
      if (!moyenPaiement) {
        return response.status(404).json({ message: "Moyen de paiement non trouvé" });
      }
      const updatedMoyenPaiement = Object.assign(moyenPaiement, request.body);
      await this.moyenPaiementRepository.save(updatedMoyenPaiement);
      return response.json({ message: "Moyen de paiement mis à jour", moyenPaiement: updatedMoyenPaiement });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du moyen de paiement:", error);
      return response.status(500).json({ message: "Erreur lors de la mise à jour du moyen de paiement", error });
    }
  }
  async deleteMoyenPaiement(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const moyenPaiement = await this.moyenPaiementRepository.findOne({ where: { id } });
      if (!moyenPaiement) {
        return response.status(404).json({ message: "Moyen de paiement non trouvé" });
      }
      await this.moyenPaiementRepository.remove(moyenPaiement);
      return response.json({ message: "Moyen de paiement supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du moyen de paiement:", error);
      return response.status(500).json({ message: "Erreur lors de la suppression du moyen de paiement", error });
    }
  }}
