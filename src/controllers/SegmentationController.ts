import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { Segmentation } from "../entities/Segmentation";

export class SegmentationController {
  private segmentationRepository = AppDataSource.getRepository(Segmentation);

  async createSegmentation(request: Request, response: Response) {
    try {
      const { nom, commentaire } = request.body;
      const segmentation = this.segmentationRepository.create({ nom, commentaire });
      await this.segmentationRepository.save(segmentation);
      response.json({ message: "Segmentation créée", segmentation });
    } catch (error) {
      console.error("Erreur lors de la création de la segmentation:", error);
      response.status(500).json({ message: "Erreur lors de la création de la segmentation", error });
    }
  }

  async getAllSegmentations(request: Request, response: Response) {
    try {
      const segmentations = await this.segmentationRepository.find();
      response.json(segmentations);
    } catch (error) {
      console.error("Erreur lors de la récupération des segmentations:", error);
      response.status(500).json({ message: "Erreur lors de la récupération des segmentations", error });
    }
  }

  async getSegmentationById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const segmentation = await this.segmentationRepository.findOne({ where: { id } });
      if (segmentation) {
        response.json(segmentation);
      } else {
        response.status(404).json({ message: "Segmentation non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la segmentation:", error);
      response.status(500).json({ message: "Erreur lors de la récupération de la segmentation", error });
    }
  }

  async updateSegmentation(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const segmentation = await this.segmentationRepository.findOne({ where: { id } });
      if (!segmentation) {
        return response.status(404).json({ message: "Segmentation non trouvée" });
      }
      const updatedSegmentation = Object.assign(segmentation, request.body);
      await this.segmentationRepository.save(updatedSegmentation);
      response.json({ message: "Segmentation mise à jour", segmentation: updatedSegmentation });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la segmentation:", error);
      response.status(500).json({ message: "Erreur lors de la mise à jour de la segmentation", error });
    }
  }

  async deleteSegmentation(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const segmentation = await this.segmentationRepository.findOne({ where: { id } });
      if (!segmentation) {
        return response.status(404).json({ message: "Segmentation non trouvée" });
      }
      await this.segmentationRepository.remove(segmentation);
      response.json({ message: "Segmentation supprimée" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la segmentation:", error);
      response.status(500).json({ message: "Erreur lors de la suppression de la segmentation", error });
    }
  }
}
