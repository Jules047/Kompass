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
exports.MoyenPaiementController = void 0;
const data_source_1 = require("../data-source");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
class MoyenPaiementController {
    constructor() {
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
    }
    createMoyenPaiement(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { moyen } = request.body;
                const moyenPaiement = this.moyenPaiementRepository.create({ moyen });
                yield this.moyenPaiementRepository.save(moyenPaiement);
                response.json({ message: "Moyen de paiement créé", moyenPaiement });
            }
            catch (error) {
                console.error("Erreur lors de la création du moyen de paiement:", error);
                response.status(500).json({ message: "Erreur lors de la création du moyen de paiement", error });
            }
        });
    }
    getAllMoyensPaiement(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const moyensPaiement = yield this.moyenPaiementRepository.find();
                response.json(moyensPaiement);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des moyens de paiement:", error);
                response.status(500).json({ message: "Erreur lors de la récupération des moyens de paiement", error });
            }
        });
    }
    getMoyenPaiementById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({ where: { id } });
                if (moyenPaiement) {
                    response.json(moyenPaiement);
                }
                else {
                    response.status(404).json({ message: "Moyen de paiement non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du moyen de paiement:", error);
                response.status(500).json({ message: "Erreur lors de la récupération du moyen de paiement", error });
            }
        });
    }
    updateMoyenPaiement(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({ where: { id } });
                if (!moyenPaiement) {
                    return response.status(404).json({ message: "Moyen de paiement non trouvé" });
                }
                const updatedMoyenPaiement = Object.assign(moyenPaiement, request.body);
                yield this.moyenPaiementRepository.save(updatedMoyenPaiement);
                return response.json({ message: "Moyen de paiement mis à jour", moyenPaiement: updatedMoyenPaiement });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du moyen de paiement:", error);
                return response.status(500).json({ message: "Erreur lors de la mise à jour du moyen de paiement", error });
            }
        });
    }
    deleteMoyenPaiement(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const moyenPaiement = yield this.moyenPaiementRepository.findOne({ where: { id } });
                if (!moyenPaiement) {
                    return response.status(404).json({ message: "Moyen de paiement non trouvé" });
                }
                yield this.moyenPaiementRepository.remove(moyenPaiement);
                return response.json({ message: "Moyen de paiement supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du moyen de paiement:", error);
                return response.status(500).json({ message: "Erreur lors de la suppression du moyen de paiement", error });
            }
        });
    }
}
exports.MoyenPaiementController = MoyenPaiementController;
//# sourceMappingURL=MoyenPaiementController.js.map