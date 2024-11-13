import { Request, Response } from "express";
import { Famille } from "../entities/Famille";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

const familleRepository: Repository<Famille> =
  AppDataSource.getRepository(Famille);

export class FamilleController {
  static async createFamille(req: Request, res: Response): Promise<Response> {
    const { designation, tva } = req.body;

    if (!designation) {
      return res
        .status(400)
        .json({ message: "Le champ désignation est obligatoire." });
    }

    try {
      const newFamille = familleRepository.create({
        designation,
        tva: parseFloat(tva),
      });
      await familleRepository.save(newFamille);
      return res.status(201).json(newFamille);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erreur lors de la création de la famille", error });
    }
  }

  static async getAllFamilles(req: Request, res: Response): Promise<Response> {
    try {
      const familles = await familleRepository.find({
        relations: ["sousfamilles"],
      });
      return res.status(200).json(familles);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des familles",
        error,
      });
    }
  }

  static async getFamilleById(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const famille = await familleRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ["sousfamilles"],
      });

      if (!famille) {
        return res.status(404).json({ message: "Famille non trouvée" });
      }

      return res.status(200).json(famille);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération de la famille",
        error,
      });
    }
  }

  static async updateFamille(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const { designation, tva } = req.body;

    try {
      const famille = await familleRepository.findOneBy({
        id: parseInt(id, 10),
      });

      if (!famille) {
        return res.status(404).json({ message: "Famille non trouvée" });
      }

      famille.designation = designation;
      famille.tva = parseFloat(tva);

      const updatedFamille = await familleRepository.save(famille);
      return res.status(200).json(updatedFamille);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour de la famille",
        error,
      });
    }
  }

  static async deleteFamille(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    try {
      const famille = await familleRepository.findOneBy({
        id: parseInt(id, 10),
      });

      if (!famille) {
        return res.status(404).json({ message: "Famille non trouvée" });
      }

      await familleRepository.remove(famille);
      return res
        .status(200)
        .json({ message: "Famille supprimée avec succès🥰" });
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la suppression de la famille",
        error,
      });
    }
  }
}
