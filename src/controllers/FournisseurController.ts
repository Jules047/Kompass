import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Fournisseur } from "../entities/Fournisseur";

export class FournisseurController {
  private fournisseurRepository = AppDataSource.getRepository(Fournisseur);

  async createFournisseur(request: Request, response: Response) {
    try {
      const fournisseur = this.fournisseurRepository.create(request.body);
      await this.fournisseurRepository.save(fournisseur);
      response.json({ message: "Fournisseur créé", fournisseur });
    } catch (error) {
      console.error("Erreur lors de la création du fournisseur:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la création du fournisseur", error });
    }
  }

  async getAllFournisseurs(request: Request, response: Response) {
    try {
      const fournisseurs = await this.fournisseurRepository.find();
      response.json(fournisseurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des fournisseurs:", error);
      response
        .status(500)
        .json({
          message: "Erreur lors de la récupération des fournisseurs",
          error,
        });
    }
  }

  async getFournisseurById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id },
      });
      if (fournisseur) {
        response.json(fournisseur);
      } else {
        response.status(404).json({ message: "Fournisseur non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du fournisseur:", error);
      response
        .status(500)
        .json({
          message: "Erreur lors de la récupération du fournisseur",
          error,
        });
    }
  }

  async updateFournisseur(request: Request, response: Response) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const id = parseInt(request.params.id);
      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id },
      });
      if (fournisseur) {
        this.fournisseurRepository.merge(fournisseur, request.body);
        const results = await queryRunner.manager.save(fournisseur);

        // Mise à jour du solde_total
        await queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
          id,
        ]);

        await queryRunner.commitTransaction();

        // Récupérer le fournisseur mis à jour avec le nouveau solde_total
        const updatedFournisseur = await this.fournisseurRepository.findOne({
          where: { id },
        });
        response.json({
          message: "Fournisseur mis à jour",
          fournisseur: updatedFournisseur,
        });
      } else {
        response.status(404).json({ message: "Fournisseur non trouvé" });
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Erreur lors de la mise à jour du fournisseur:", error);
      response
        .status(500)
        .json({
          message: "Erreur lors de la mise à jour du fournisseur",
          error,
        });
    } finally {
      await queryRunner.release();
    }
  }

  async deleteFournisseur(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const fournisseur = await this.fournisseurRepository.findOne({
        where: { id },
      });
      if (fournisseur) {
        await this.fournisseurRepository.remove(fournisseur);
        response.json({ message: "Fournisseur supprimé" });
      } else {
        response.status(404).json({ message: "Fournisseur non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du fournisseur:", error);
      response
        .status(500)
        .json({
          message: "Erreur lors de la suppression du fournisseur",
          error,
        });
    }
  }
}
