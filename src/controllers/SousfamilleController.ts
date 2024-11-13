import { Request, Response } from "express";
import { Sousfamille } from "../entities/Sousfamille";
import { Famille } from "../entities/Famille";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";

const sousfamilleRepository: Repository<Sousfamille> =
  AppDataSource.getRepository(Sousfamille);
const familleRepository: Repository<Famille> =
  AppDataSource.getRepository(Famille);

export class SousfamilleController {
  static async createSousfamille(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { designation, familleId } = req.body;

    if (!designation || !familleId) {
      return res.status(400).json({
        message: "Les champs désignation et familleId sont obligatoires.",
      });
    }

    try {
      const famille = await familleRepository.findOneBy({ id: familleId });
      if (!famille) {
        return res.status(404).json({ message: "Famille non trouvée" });
      }

      const newSousfamille = sousfamilleRepository.create({
        designation,
        famille,
      });

      await sousfamilleRepository.save(newSousfamille);
      return res.status(201).json(newSousfamille);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la création de la sous-famille",
        error,
      });
    }
  }

  static async getAllSousfamilles(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const sousfamilles = await sousfamilleRepository.find({
        relations: ["famille"],
      });
      return res.status(200).json(sousfamilles);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des sous-familles",
        error,
      });
    }
  }

  static async getSousfamilleById(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;

    try {
      const sousfamille = await sousfamilleRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ["famille"],
      });

      if (!sousfamille) {
        return res.status(404).json({ message: "Sous-famille non trouvée" });
      }

      return res.status(200).json(sousfamille);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération de la sous-famille",
        error,
      });
    }
  }

  static async updateSousfamille(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;
    const { designation, familleId } = req.body;

    try {
      const sousfamille = await sousfamilleRepository.findOne({
        where: { id: parseInt(id, 10) },
        relations: ["famille"],
      });

      if (!sousfamille) {
        return res.status(404).json({ message: "Sous-famille non trouvée" });
      }

      if (familleId) {
        const famille = await familleRepository.findOneBy({ id: familleId });
        if (!famille) {
          return res.status(404).json({ message: "Famille non trouvée" });
        }
        sousfamille.famille = famille;
      }

      sousfamille.designation = designation || sousfamille.designation;
      await sousfamilleRepository.save(sousfamille);
      return res.status(200).json(sousfamille);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la mise à jour de la sous-famille",
        error,
      });
    }
  }

  static async deleteSousfamille(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { id } = req.params;

    try {
      const sousfamille = await sousfamilleRepository.findOneBy({
        id: parseInt(id, 10),
      });

      if (!sousfamille) {
        return res.status(404).json({ message: "Sous-famille non trouvée" });
      }

      await sousfamilleRepository.remove(sousfamille);
      return res
        .status(200)
        .json({ message: "Sous-famille supprimée avec succès🥰" });
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la suppression de la sous-famille",
        error,
      });
    }
  }

  static async getSousfamillesByFamilleId(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { familleId } = req.params;

    try {
      const sousfamilles = await sousfamilleRepository.find({
        where: { famille: { id: parseInt(familleId, 10) } },
        relations: ["famille"],
      });

      return res.status(200).json(sousfamilles);
    } catch (error) {
      return res.status(500).json({
        message: "Erreur lors de la récupération des sous-familles",
        error,
      });
    }
  }
}
