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
exports.FournisseurController = void 0;
const data_source_1 = require("../data-source");
const Fournisseur_1 = require("../entities/Fournisseur");
class FournisseurController {
    constructor() {
        this.fournisseurRepository = data_source_1.AppDataSource.getRepository(Fournisseur_1.Fournisseur);
    }
    createFournisseur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fournisseur = this.fournisseurRepository.create(request.body);
                yield this.fournisseurRepository.save(fournisseur);
                response.json({ message: "Fournisseur créé", fournisseur });
            }
            catch (error) {
                console.error("Erreur lors de la création du fournisseur:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la création du fournisseur", error });
            }
        });
    }
    getAllFournisseurs(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fournisseurs = yield this.fournisseurRepository.find();
                response.json(fournisseurs);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des fournisseurs:", error);
                response
                    .status(500)
                    .json({
                    message: "Erreur lors de la récupération des fournisseurs",
                    error,
                });
            }
        });
    }
    getFournisseurById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const fournisseur = yield this.fournisseurRepository.findOne({
                    where: { id },
                });
                if (fournisseur) {
                    response.json(fournisseur);
                }
                else {
                    response.status(404).json({ message: "Fournisseur non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du fournisseur:", error);
                response
                    .status(500)
                    .json({
                    message: "Erreur lors de la récupération du fournisseur",
                    error,
                });
            }
        });
    }
    updateFournisseur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const queryRunner = data_source_1.AppDataSource.createQueryRunner();
            yield queryRunner.connect();
            yield queryRunner.startTransaction();
            try {
                const id = parseInt(request.params.id);
                const fournisseur = yield this.fournisseurRepository.findOne({
                    where: { id },
                });
                if (fournisseur) {
                    this.fournisseurRepository.merge(fournisseur, request.body);
                    const results = yield queryRunner.manager.save(fournisseur);
                    yield queryRunner.query("SELECT update_fournisseur_solde_total($1)", [
                        id,
                    ]);
                    yield queryRunner.commitTransaction();
                    const updatedFournisseur = yield this.fournisseurRepository.findOne({
                        where: { id },
                    });
                    response.json({
                        message: "Fournisseur mis à jour",
                        fournisseur: updatedFournisseur,
                    });
                }
                else {
                    response.status(404).json({ message: "Fournisseur non trouvé" });
                }
            }
            catch (error) {
                yield queryRunner.rollbackTransaction();
                console.error("Erreur lors de la mise à jour du fournisseur:", error);
                response
                    .status(500)
                    .json({
                    message: "Erreur lors de la mise à jour du fournisseur",
                    error,
                });
            }
            finally {
                yield queryRunner.release();
            }
        });
    }
    deleteFournisseur(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const fournisseur = yield this.fournisseurRepository.findOne({
                    where: { id },
                });
                if (fournisseur) {
                    yield this.fournisseurRepository.remove(fournisseur);
                    response.json({ message: "Fournisseur supprimé" });
                }
                else {
                    response.status(404).json({ message: "Fournisseur non trouvé" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la suppression du fournisseur:", error);
                response
                    .status(500)
                    .json({
                    message: "Erreur lors de la suppression du fournisseur",
                    error,
                });
            }
        });
    }
}
exports.FournisseurController = FournisseurController;
//# sourceMappingURL=FournisseurController.js.map