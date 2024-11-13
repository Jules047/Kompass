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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceApresVenteController = void 0;
const data_source_1 = require("../data-source");
const ServiceApresVente_1 = require("../entities/ServiceApresVente");
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
class ServiceApresVenteController {
    constructor() {
        this.serviceApresVenteRepository = data_source_1.AppDataSource.getRepository(ServiceApresVente_1.ServiceApresVente);
    }
    createServiceApresVente(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const serviceApresVente = this.serviceApresVenteRepository.create(request.body);
                yield this.serviceApresVenteRepository.save(serviceApresVente);
                response.json({ message: "Service après-vente créé", serviceApresVente });
            }
            catch (error) {
                console.error("Erreur lors de la création du service après-vente:", error);
                response.status(500).json({ message: "Erreur lors de la création du service après-vente", error });
            }
        });
    }
    getAllServiceApresVente(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const servicesApresVente = yield this.serviceApresVenteRepository.find({
                    relations: ["client", "machine"]
                });
                response.json(servicesApresVente);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des services après-vente:", error);
                response.status(500).json({ message: "Erreur lors de la récupération des services après-vente", error });
            }
        });
    }
    getServiceApresVenteById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const serviceApresVente = yield this.serviceApresVenteRepository.findOne({
                    where: { id },
                    relations: ["client", "machine"]
                });
                if (serviceApresVente) {
                    response.json(serviceApresVente);
                }
                else {
                    response.status(404).json({ message: "Service après-vente non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du service après-vente:", error);
                response.status(500).json({ message: "Erreur lors de la récupération du service après-vente", error });
            }
        });
    }
    updateServiceApresVente(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const serviceApresVente = yield this.serviceApresVenteRepository.findOne({ where: { id } });
                if (!serviceApresVente) {
                    return response.status(404).json({ message: "Service après-vente non trouvé" });
                }
                this.serviceApresVenteRepository.merge(serviceApresVente, request.body);
                yield this.serviceApresVenteRepository.save(serviceApresVente);
                return response.json({ message: "Service après-vente mis à jour", serviceApresVente });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du service après-vente:", error);
                return response.status(500).json({ message: "Erreur lors de la mise à jour du service après-vente", error });
            }
        });
    }
    deleteServiceApresVente(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const serviceApresVente = yield this.serviceApresVenteRepository.findOne({ where: { id } });
                if (!serviceApresVente) {
                    return response.status(404).json({ message: "Service après-vente non trouvé" });
                }
                yield this.serviceApresVenteRepository.remove(serviceApresVente);
                return response.json({ message: "Service après-vente supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du service après-vente:", error);
                return response.status(500).json({ message: "Erreur lors de la suppression du service après-vente", error });
            }
        });
    }
    generatePDF(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const serviceApresVente = yield this.serviceApresVenteRepository.findOne({
                    where: { id },
                    relations: ["client", "machine"]
                });
                if (!serviceApresVente) {
                    response.status(404).json({ message: "Service après-vente non trouvé" });
                    return;
                }
                const doc = new pdfkit_1.default({ size: "A4", margin: 50 });
                const filename = `SAV${String(serviceApresVente.id).padStart(4, "0")}.pdf`;
                response.setHeader("Content-disposition", 'attachment; filename="' + filename + '"');
                response.setHeader("Content-type", "application/pdf");
                doc.pipe(response);
                const imagePath = path_1.default.join(__dirname, '..', '..', 'src', 'assets', 'depannpc.png');
                doc.image(imagePath, {
                    fit: [60, 100]
                });
                doc.moveDown();
                doc.fontSize(25).text("Service Après-Vente", { align: "center" });
                doc.moveDown();
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
                doc.fontSize(12);
                doc.text(`Client: ${serviceApresVente.client.nom} ${serviceApresVente.client.prenom}`, 400, startY);
                doc.text(`Adresse: ${serviceApresVente.client.adresse}`, 400, doc.y);
                doc.text(`Code Postal: ${serviceApresVente.client.code_postal}`, 400, doc.y);
                doc.text(`Ville: ${serviceApresVente.client.ville}`, 400, doc.y);
                doc.text(`Téléphone: ${serviceApresVente.client.telephone}`, 400, doc.y);
                doc.text(`Email: ${serviceApresVente.client.email}`, 400, doc.y);
                doc.end();
            }
            catch (error) {
                console.error("Erreur lors de la génération du PDF:", error);
                response.status(500).json({ message: "Erreur lors de la génération du PDF", error });
            }
        });
    }
}
exports.ServiceApresVenteController = ServiceApresVenteController;
//# sourceMappingURL=ServiceApresVenteController.js.map