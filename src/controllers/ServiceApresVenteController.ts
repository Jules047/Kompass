import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { ServiceApresVente } from "../entities/ServiceApresVente";
import PDFDocument from 'pdfkit';
import path from "path";


export class ServiceApresVenteController {
  private serviceApresVenteRepository = AppDataSource.getRepository(ServiceApresVente);

  async createServiceApresVente(request: Request, response: Response) {
    try {
      const serviceApresVente = this.serviceApresVenteRepository.create(request.body);
      await this.serviceApresVenteRepository.save(serviceApresVente);
      response.json({ message: "Service après-vente créé", serviceApresVente });
    } catch (error) {
      console.error("Erreur lors de la création du service après-vente:", error);
      response.status(500).json({ message: "Erreur lors de la création du service après-vente", error });
    }
  }

  async getAllServiceApresVente(request: Request, response: Response) {
    try {
      const servicesApresVente = await this.serviceApresVenteRepository.find({
        relations: ["client", "machine"]
      });
      response.json(servicesApresVente);
    } catch (error) {
      console.error("Erreur lors de la récupération des services après-vente:", error);
      response.status(500).json({ message: "Erreur lors de la récupération des services après-vente", error });
    }
  }

  async getServiceApresVenteById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const serviceApresVente = await this.serviceApresVenteRepository.findOne({
        where: { id },
        relations: ["client", "machine"]
      });
      if (serviceApresVente) {
        response.json(serviceApresVente);
      } else {
        response.status(404).json({ message: "Service après-vente non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du service après-vente:", error);
      response.status(500).json({ message: "Erreur lors de la récupération du service après-vente", error });
    }
  }

  async updateServiceApresVente(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      const serviceApresVente = await this.serviceApresVenteRepository.findOne({ where: { id } });
      if (!serviceApresVente) {
        return response.status(404).json({ message: "Service après-vente non trouvé" });
      }
      this.serviceApresVenteRepository.merge(serviceApresVente, request.body);
      await this.serviceApresVenteRepository.save(serviceApresVente);
      return response.json({ message: "Service après-vente mis à jour", serviceApresVente });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du service après-vente:", error);
      return response.status(500).json({ message: "Erreur lors de la mise à jour du service après-vente", error });
    }
  }
  async deleteServiceApresVente(request: Request, response: Response): Promise<Response> {
    try {
      const id = parseInt(request.params.id);
      const serviceApresVente = await this.serviceApresVenteRepository.findOne({ where: { id } });
      if (!serviceApresVente) {
        return response.status(404).json({ message: "Service après-vente non trouvé" });
      }
      await this.serviceApresVenteRepository.remove(serviceApresVente);
      return response.json({ message: "Service après-vente supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du service après-vente:", error);
      return response.status(500).json({ message: "Erreur lors de la suppression du service après-vente", error });
    }
  }
    async generatePDF(request: Request, response: Response): Promise<void> {
    try {
      const id = parseInt(request.params.id);
      const serviceApresVente = await this.serviceApresVenteRepository.findOne({
        where: { id },
        relations: ["client", "machine"]
      });

      if (!serviceApresVente) {
        response.status(404).json({ message: "Service après-vente non trouvé" });
        return;
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `SAV${String(serviceApresVente.id).padStart(4, "0")}.pdf`;

      response.setHeader(
        "Content-disposition",
        'attachment; filename="' + filename + '"'
      );
      response.setHeader("Content-type", "application/pdf");

      doc.pipe(response);

      const imagePath = path.join(__dirname, '..', '..', 'src', 'assets', 'depannpc.png');
      doc.image(imagePath, {
        fit: [60, 100]
      });

      doc.moveDown();

      // En-tête
      doc.fontSize(25).text("Service Après-Vente", { align: "center" });
      doc.moveDown();

      // Informations du service après-vente (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: SAV${String(serviceApresVente.id).padStart(4, "0")}`);
      doc.text(`État: ${serviceApresVente.etat}`);
      doc.moveDown();
      doc.text(`Machine: ${serviceApresVente.machine.marque} ${serviceApresVente.machine.label} (${serviceApresVente.machine.couleur})`);
      doc.moveDown();
      doc.text(`Date de récupération: ${serviceApresVente.date_recuperation ? new Date(serviceApresVente.date_recuperation).toLocaleDateString() : 'Non définie'}`);
      doc.text(`Date de restitution: ${serviceApresVente.etat === 'Restitué' ? (serviceApresVente.date_restitution ? new Date(serviceApresVente.date_restitution).toLocaleDateString() : 'Non définie') : 'Pas Restitué'}`);
      doc.text(`Date de rendu: ${serviceApresVente.date_rendu ? new Date(serviceApresVente.date_rendu).toLocaleDateString() : 'Pas encore rendu'}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(`Client: ${serviceApresVente.client.nom} ${serviceApresVente.client.prenom}`, 400, startY);
      doc.text(`Adresse: ${serviceApresVente.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${serviceApresVente.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${serviceApresVente.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${serviceApresVente.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${serviceApresVente.client.email}`, 400, doc.y);

      doc.end();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      response.status(500).json({ message: "Erreur lors de la génération du PDF", error });
    }
}}