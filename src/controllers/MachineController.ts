import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { Machine } from "../entities/Machine";

export class MachineController {
  private machineRepository = AppDataSource.getRepository(Machine);

  async createMachine(request: Request, response: Response) {
    try {
      const machine = this.machineRepository.create(request.body);
      await this.machineRepository.save(machine);
      response.json({ message: "Machine créée", machine });
    } catch (error) {
      console.error("Erreur lors de la création de la machine:", error);
      response.status(500).json({ message: "Erreur lors de la création de la machine", error });
    }
  }

  async getAllMachines(request: Request, response: Response) {
    try {
      const machines = await this.machineRepository.find();
      response.json(machines);
    } catch (error) {
      console.error("Erreur lors de la récupération des machines:", error);
      response.status(500).json({ message: "Erreur lors de la récupération des machines", error });
    }
  }

  async getMachineById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const machine = await this.machineRepository.findOne({ where: { id } });
      if (machine) {
        response.json(machine);
      } else {
        response.status(404).json({ message: "Machine non trouvée" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la machine:", error);
      response.status(500).json({ message: "Erreur lors de la récupération de la machine", error });
    }
  }

  async updateMachine(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const machine = await this.machineRepository.findOne({ where: { id } });
      if (!machine) {
        return response.status(404).json({ message: "Machine non trouvée" });
      }
      this.machineRepository.merge(machine, request.body);
      await this.machineRepository.save(machine);
      response.json({ message: "Machine mise à jour", machine });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la machine:", error);
      response.status(500).json({ message: "Erreur lors de la mise à jour de la machine", error });
    }
  }

  async deleteMachine(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const machine = await this.machineRepository.findOne({ where: { id } });
      if (!machine) {
        return response.status(404).json({ message: "Machine non trouvée" });
      }
      await this.machineRepository.remove(machine);
      response.json({ message: "Machine supprimée" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la machine:", error);
      response.status(500).json({ message: "Erreur lors de la suppression de la machine", error });
    }
  }
}
