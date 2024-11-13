"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketController = void 0;
const data_source_1 = require("../data-source");
const Ticket_1 = require("../entities/Ticket");
const Client_1 = require("../entities/Client");
const PriseEnCharge_1 = require("../entities/PriseEnCharge");
const Vendeur_1 = require("../entities/Vendeur");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
class TicketController {
    constructor() {
        this.ticketRepository = data_source_1.AppDataSource.getRepository(Ticket_1.Ticket);
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.priseEnChargeRepository = data_source_1.AppDataSource.getRepository(PriseEnCharge_1.PriseEnCharge);
        this.vendeurRepository = data_source_1.AppDataSource.getRepository(Vendeur_1.Vendeur);
    }
    createTicket(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = request.body, { clients_id, prises_en_charge_id, vendeurs_id } = _a, ticketData = __rest(_a, ["clients_id", "prises_en_charge_id", "vendeurs_id"]);
                const client = yield this.clientRepository.findOne({
                    where: { id: clients_id },
                });
                const priseEnCharge = yield this.priseEnChargeRepository.findOne({
                    where: { id: prises_en_charge_id },
                });
                const vendeur = yield this.vendeurRepository.findOne({
                    where: { id: vendeurs_id },
                });
                if (!client || !priseEnCharge || !vendeur) {
                    return response
                        .status(404)
                        .json({ message: "Client, PriseEnCharge ou Vendeur non trouvé" });
                }
                const ticket = this.ticketRepository.create(Object.assign(Object.assign({}, ticketData), { clients_id,
                    prises_en_charge_id,
                    vendeurs_id,
                    client,
                    priseEnCharge,
                    vendeur }));
                yield this.ticketRepository.save(ticket);
                return response.json({ message: "Ticket créé", ticket });
            }
            catch (error) {
                console.error("Erreur lors de la création du ticket:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la création du ticket", error });
            }
        });
    }
    getAllTickets(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tickets = yield this.ticketRepository.find({
                    relations: ["client", "priseEnCharge", "vendeur"],
                });
                response.json(tickets);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des tickets:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération des tickets", error });
            }
        });
    }
    getTicketById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                if (isNaN(id)) {
                    return response.status(400).json({ message: "ID de ticket invalide" });
                }
                const ticket = yield this.ticketRepository.findOne({
                    where: { id },
                    relations: ["client", "priseEnCharge", "vendeur"],
                });
                if (ticket) {
                    return response.json(ticket);
                }
                else {
                    return response.status(404).json({ message: "Ticket non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du ticket:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération du ticket", error });
            }
        });
    }
    updateTicket(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const ticket = yield this.ticketRepository.findOne({ where: { id } });
                if (!ticket) {
                    return response.status(404).json({ message: "Ticket non trouvé" });
                }
                const updatedTicket = Object.assign(ticket, request.body);
                yield this.ticketRepository.save(updatedTicket);
                return response.json({
                    message: "Ticket mis à jour",
                    ticket: updatedTicket,
                });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du ticket:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la mise à jour du ticket", error });
            }
        });
    }
    deleteTicket(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const ticket = yield this.ticketRepository.findOne({ where: { id } });
                if (!ticket) {
                    return response.status(404).json({ message: "Ticket non trouvé" });
                }
                yield this.ticketRepository.remove(ticket);
                return response.json({ message: "Ticket supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du ticket:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la suppression du ticket", error });
            }
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const ticket = yield this.ticketRepository.findOne({
                    where: { id },
                    relations: ["client", "priseEnCharge", "vendeur"],
                });
                if (!ticket) {
                    response.status(404).json({ message: "Ticket non trouvé" });
                    return;
                }
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `TCT${String(ticket.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, "..", "..", "src", "assets", "depannpc.png");
                doc.image(imagePath, {
                    fit: [60, 100],
                });
                doc.moveDown();
                doc.fontSize(25).text("Ticket", { align: "center" });
                doc.moveDown();
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
                doc.fontSize(12);
                doc.text(`Client: ${ticket.client.nom} ${ticket.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${ticket.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${ticket.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${ticket.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${ticket.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${ticket.client.email}`, 400, doc.y);
                doc.moveDown();
                doc.text("Informations du vendeur:");
                doc.text(`Nom: ${ticket.vendeur.nom} ${ticket.vendeur.prenom}`);
                doc.text(`Email: ${ticket.vendeur.email}`);
                doc.text(`Adresse: ${ticket.vendeur.adresse}`);
                doc.text(`Code Postal: ${ticket.vendeur.code_postal}`);
                doc.text(`Ville: ${ticket.vendeur.ville}`);
                doc.text(`Téléphone 1: ${ticket.vendeur.telephone1 || "Non renseigné"}`);
                doc.text(`Téléphone 2: ${ticket.vendeur.telephone2 || "Non renseigné"}`);
                doc.end();
            }
            catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la génération du PDF", error });
            }
        });
    }
}
exports.TicketController = TicketController;
//# sourceMappingURL=TicketController.js.map