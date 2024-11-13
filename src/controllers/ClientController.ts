import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Client } from "../entities/Client";
import { Segmentation } from "../entities/Segmentation";

export class ClientController {
  private clientRepository = AppDataSource.getRepository(Client);
  private segmentationRepository = AppDataSource.getRepository(Segmentation);

  async createClient(request: Request, response: Response): Promise<void> {
    try {
      const { segment_id, ...clientData } = request.body;
      const segment = await this.segmentationRepository.findOne({
        where: { id: segment_id },
      });
      if (!segment) {
        response.status(404).json({ message: "Segment non trouvé" });
        return;
      }
      const client = this.clientRepository.create({
        ...clientData,
        segment_id,
        segment,
      });
      await this.clientRepository.save(client);
      response.json({ message: "Client créé", client });
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la création du client", error });
    }
  }
  async getAllClients(request: Request, response: Response) {
    try {
      const clients = await this.clientRepository.find({
        relations: ["segment"],
      });
      response.json(clients);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération des clients", error });
    }
  }

  async getClientById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const client = await this.clientRepository.findOne({
        where: { id, actif: true },
        relations: ["segment"],
      });
      if (client) {
        response.json(client);
      } else {
        response.status(404).json({ message: "Client non trouvé ou inactif" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du client:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération du client", error });
    }
  }

  async updateClient(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const { segment_id, ...clientData } = request.body;
      const client = await this.clientRepository.findOne({
        where: { id },
        relations: ["segment"],
      });
      if (!client) {
        return response.status(404).json({ message: "Client non trouvé" });
      }
      if (segment_id) {
        const segment = await this.segmentationRepository.findOne({
          where: { id: segment_id },
        });
        if (!segment) {
          return response.status(404).json({ message: "Segment non trouvé" });
        }
        client.segment = segment;
        client.segment_id = segment_id;
      }
      Object.assign(client, clientData);
      await this.clientRepository.save(client);
      return response.json({ message: "Client mis à jour", client });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du client", error });
    }
  }
  async deleteClient(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const client = await this.clientRepository.findOne({ where: { id } });
      if (!client) {
        return response.status(404).json({ message: "Client non trouvé" });
      }
      await this.clientRepository.remove(client);
      return response.json({ message: "Client supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du client:", error);
      return response
        .status(500)
        .json({ message: "Erreur lors de la suppression du client", error });
    }
  }}
