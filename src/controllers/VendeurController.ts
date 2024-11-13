import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { Vendeur } from "../entities/Vendeur";

export class VendeurController {
  private vendeurRepository = AppDataSource.getRepository(Vendeur);

  async createVendeur(request: Request, response: Response) {
    try {
      const vendeur = this.vendeurRepository.create(request.body);
      await this.vendeurRepository.save(vendeur);
      response.json({ message: "Vendeur créé", vendeur });
    } catch (error) {
      console.error("Erreur lors de la création du vendeur:", error);
      response.status(500).json({ message: "Erreur lors de la création du vendeur", error });
    }
  }

  async getAllVendeurs(request: Request, response: Response) {
    try {
      const vendeurs = await this.vendeurRepository.find();
      response.json(vendeurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des vendeurs:", error);
      response.status(500).json({ message: "Erreur lors de la récupération des vendeurs", error });
    }
  }

  async getVendeurById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const vendeur = await this.vendeurRepository.findOne({ where: { id } });
      if (vendeur) {
        response.json(vendeur);
      } else {
        response.status(404).json({ message: "Vendeur non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du vendeur:", error);
      response.status(500).json({ message: "Erreur lors de la récupération du vendeur", error });
    }
  }

  async updateVendeur(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const vendeur = await this.vendeurRepository.findOne({ where: { id } });
      if (!vendeur) {
        return response.status(404).json({ message: "Vendeur non trouvé" });
      }
      this.vendeurRepository.merge(vendeur, request.body);
      await this.vendeurRepository.save(vendeur);
      return response.json({ message: "Vendeur mis à jour", vendeur });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du vendeur:", error);
      return response.status(500).json({ message: "Erreur lors de la mise à jour du vendeur", error });
    }
  }
  async deleteVendeur(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const vendeur = await this.vendeurRepository.findOne({ where: { id } });
      if (!vendeur) {
        return response.status(404).json({ message: "Vendeur non trouvé" });
      }
      await this.vendeurRepository.remove(vendeur);
      return response.json({ message: "Vendeur supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du vendeur:", error);
      return response.status(500).json({ message: "Erreur lors de la suppression du vendeur", error });
    }
  }}
