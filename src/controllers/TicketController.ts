import { Request, Response } from "express";
import { AppDataSource } from '../data-source';
import { Ticket } from "../entities/Ticket";
import { Client } from "../entities/Client";
import { PriseEnCharge } from "../entities/PriseEnCharge";
import { Vendeur } from "../entities/Vendeur";
import PDFDocument from 'pdfkit';
import path from "path";

export class TicketController {
  private ticketRepository = AppDataSource.getRepository(Ticket);
  private clientRepository = AppDataSource.getRepository(Client);
  private priseEnChargeRepository = AppDataSource.getRepository(PriseEnCharge);
  private vendeurRepository = AppDataSource.getRepository(Vendeur);

  async createTicket(request: Request, response: Response) {
    try {
      const { clients_id, prises_en_charge_id, vendeurs_id, ...ticketData } =
        request.body;

      const client = await this.clientRepository.findOne({
        where: { id: clients_id },
      });
      const priseEnCharge = await this.priseEnChargeRepository.findOne({
        where: { id: prises_en_charge_id },
      });
      const vendeur = await this.vendeurRepository.findOne({
        where: { id: vendeurs_id },
      });

      if (!client || !priseEnCharge || !vendeur) {
        return response
          .status(404)
          .json({ message: "Client, PriseEnCharge ou Vendeur non trouvé" });
      }

      const ticket = this.ticketRepository.create({
        ...ticketData,
        clients_id,
        prises_en_charge_id,
        vendeurs_id,
        client,
        priseEnCharge,
        vendeur,
      });

      await this.ticketRepository.save(ticket);
      response.json({ message: "Ticket créé", ticket });
    } catch (error) {
      console.error("Erreur lors de la création du ticket:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la création du ticket", error });
    }
  }

  async getAllTickets(request: Request, response: Response) {
    try {
      const tickets = await this.ticketRepository.find({
        relations: ["client", "priseEnCharge", "vendeur"],
      });
      response.json(tickets);
    } catch (error) {
      console.error("Erreur lors de la récupération des tickets:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération des tickets", error });
    }
  }

  async getTicketById(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      if (isNaN(id)) {
        return response.status(400).json({ message: "ID de ticket invalide" });
      }
      const ticket = await this.ticketRepository.findOne({
        where: { id },
        relations: ["client", "priseEnCharge", "vendeur"],
      });
      if (ticket) {
        response.json(ticket);
      } else {
        response.status(404).json({ message: "Ticket non trouvé" });
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du ticket:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la récupération du ticket", error });
    }
  }

  async updateTicket(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const ticket = await this.ticketRepository.findOne({ where: { id } });
      if (!ticket) {
        return response.status(404).json({ message: "Ticket non trouvé" });
      }

      const updatedTicket = Object.assign(ticket, request.body);
      await this.ticketRepository.save(updatedTicket);
      response.json({ message: "Ticket mis à jour", ticket: updatedTicket });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du ticket:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la mise à jour du ticket", error });
    }
  }

  async deleteTicket(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const ticket = await this.ticketRepository.findOne({ where: { id } });
      if (!ticket) {
        return response.status(404).json({ message: "Ticket non trouvé" });
      }
      await this.ticketRepository.remove(ticket);
      response.json({ message: "Ticket supprimé" });
    } catch (error) {
      console.error("Erreur lors de la suppression du ticket:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la suppression du ticket", error });
    }
  }

  async generatePDF(request: Request, response: Response) {
    try {
      const id = parseInt(request.params.id);
      const ticket = await this.ticketRepository.findOne({
        where: { id },
        relations: ["client", "priseEnCharge", "vendeur"],
      });

      if (!ticket) {
        return response.status(404).json({ message: "Ticket non trouvé" });
      }

      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const filename = `TCT${String(ticket.id).padStart(4, "0")}.pdf`;

      response.setHeader(
        "Content-disposition",
        'attachment; filename="' + filename + '"'
      );
      response.setHeader("Content-type", "application/pdf");

      doc.pipe(response);

      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "src",
        "assets",
        "depannpc.png"
      );
      doc.image(imagePath, {
        fit: [60, 100],
      });

      doc.moveDown();

      // En-tête
      doc.fontSize(25).text("Ticket", { align: "center" });
      doc.moveDown();

      // Informations du ticket et de la prise en charge (left side)
      doc.fontSize(12);
      const startY = doc.y;
      doc.text(`Numéro: TCT${String(ticket.id).padStart(4, "0")}`);
      doc.text(`Date: ${new Date(ticket.date).toLocaleDateString()}`);
      doc.text(`Urgence: ${ticket.urgence}`);
      doc.moveDown();
      doc.text(`Blocage: ${ticket.blocage}`);
      doc.text(`Périmètre de panne: ${ticket.perimetre_panne}`);
      doc.text(`Secteur de panne: ${ticket.secteur_panne}`);
      doc.text(`Statut de panne: ${ticket.statut_panne}`);
      doc.text(`État: ${ticket.etat}`);
      doc.moveDown();
      doc.text(`Description: ${ticket.description}`);
      doc.text(`Accessoire: ${ticket.accessoire || "Aucun"}`);
      doc.moveDown();
      doc.text("Informations de la prise en charge:");
      doc.text(`Symptôme: ${ticket.priseEnCharge.symptome}`);
      doc.text(`Statut: ${ticket.priseEnCharge.statut}`);

      // Client information (right side)
      doc.fontSize(12);
      doc.text(
        `Client: ${ticket.client.nom} ${ticket.client.prenom}`,
        400,
        startY
      );
      doc.text(`Adresse: ${ticket.client.adresse}`, 400, doc.y);
      doc.text(`Code Postal: ${ticket.client.code_postal}`, 400, doc.y);
      doc.text(`Ville: ${ticket.client.ville}`, 400, doc.y);
      doc.text(`Téléphone: ${ticket.client.telephone}`, 400, doc.y);
      doc.text(`Email: ${ticket.client.email}`, 400, doc.y);

      doc.moveDown();

      // Informations complètes du vendeur
      doc.text("Informations du vendeur:");
      doc.text(`Nom: ${ticket.vendeur.nom} ${ticket.vendeur.prenom}`);
      doc.text(`Email: ${ticket.vendeur.email}`);
      doc.text(`Adresse: ${ticket.vendeur.adresse}`);
      doc.text(`Code Postal: ${ticket.vendeur.code_postal}`);
      doc.text(`Ville: ${ticket.vendeur.ville}`);
      doc.text(`Téléphone 1: ${ticket.vendeur.telephone1 || "Non renseigné"}`);
      doc.text(`Téléphone 2: ${ticket.vendeur.telephone2 || "Non renseigné"}`);

      doc.end();
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      response
        .status(500)
        .json({ message: "Erreur lors de la génération du PDF", error });
    }
  }
}
