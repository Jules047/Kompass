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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendeurController = void 0;
const data_source_1 = require("../data-source");
const Vendeur_1 = require("../entities/Vendeur");
class VendeurController {
    constructor() {
        this.vendeurRepository = data_source_1.AppDataSource.getRepository(Vendeur_1.Vendeur);
    }
    createVendeur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendeur = this.vendeurRepository.create(request.body);
                yield this.vendeurRepository.save(vendeur);
                response.json({ message: "Vendeur créé", vendeur });
            }
            catch (error) {
                console.error("Erreur lors de la création du vendeur:", error);
                response.status(500).json({ message: "Erreur lors de la création du vendeur", error });
            }
        });
    }
    getAllVendeurs(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vendeurs = yield this.vendeurRepository.find();
                response.json(vendeurs);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des vendeurs:", error);
                response.status(500).json({ message: "Erreur lors de la récupération des vendeurs", error });
            }
        });
    }
    getVendeurById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const vendeur = yield this.vendeurRepository.findOne({ where: { id } });
                if (vendeur) {
                    response.json(vendeur);
                }
                else {
                    response.status(404).json({ message: "Vendeur non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du vendeur:", error);
                response.status(500).json({ message: "Erreur lors de la récupération du vendeur", error });
            }
        });
    }
    updateVendeur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const vendeur = yield this.vendeurRepository.findOne({ where: { id } });
                if (!vendeur) {
                    return response.status(404).json({ message: "Vendeur non trouvé" });
                }
                this.vendeurRepository.merge(vendeur, request.body);
                yield this.vendeurRepository.save(vendeur);
                return response.json({ message: "Vendeur mis à jour", vendeur });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du vendeur:", error);
                return response.status(500).json({ message: "Erreur lors de la mise à jour du vendeur", error });
            }
        });
    }
    deleteVendeur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const vendeur = yield this.vendeurRepository.findOne({ where: { id } });
                if (!vendeur) {
                    return response.status(404).json({ message: "Vendeur non trouvé" });
                }
                yield this.vendeurRepository.remove(vendeur);
                return response.json({ message: "Vendeur supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du vendeur:", error);
                return response.status(500).json({ message: "Erreur lors de la suppression du vendeur", error });
            }
        });
    }
}
exports.VendeurController = VendeurController;
//# sourceMappingURL=VendeurController.js.map