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
exports.FamilleController = void 0;
const Famille_1 = require("../entities/Famille");
const data_source_1 = require("../data-source");
const familleRepository = data_source_1.AppDataSource.getRepository(Famille_1.Famille);
class FamilleController {
    static createFamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { designation, tva } = req.body;
            if (!designation) {
                return res
                    .status(400)
                    .json({ message: "Le champ désignation est obligatoire." });
            }
            try {
                const newFamille = familleRepository.create({
                    designation,
                    tva: parseFloat(tva),
                });
                yield familleRepository.save(newFamille);
                return res.status(201).json(newFamille);
            }
            catch (error) {
                return res
                    .status(500)
                    .json({ message: "Erreur lors de la création de la famille", error });
            }
        });
    }
    static getAllFamilles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const familles = yield familleRepository.find({
                    relations: ["sousfamilles"],
                });
                return res.status(200).json(familles);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la récupération des familles",
                    error,
                });
            }
        });
    }
    static getFamilleById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const famille = yield familleRepository.findOne({
                    where: { id: parseInt(id, 10) },
                    relations: ["sousfamilles"],
                });
                if (!famille) {
                    return res.status(404).json({ message: "Famille non trouvée" });
                }
                return res.status(200).json(famille);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la récupération de la famille",
                    error,
                });
            }
        });
    }
    static updateFamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { designation, tva } = req.body;
            try {
                const famille = yield familleRepository.findOneBy({
                    id: parseInt(id, 10),
                });
                if (!famille) {
                    return res.status(404).json({ message: "Famille non trouvée" });
                }
                famille.designation = designation;
                famille.tva = parseFloat(tva);
                const updatedFamille = yield familleRepository.save(famille);
                return res.status(200).json(updatedFamille);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la mise à jour de la famille",
                    error,
                });
            }
        });
    }
    static deleteFamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const famille = yield familleRepository.findOneBy({
                    id: parseInt(id, 10),
                });
                if (!famille) {
                    return res.status(404).json({ message: "Famille non trouvée" });
                }
                yield familleRepository.remove(famille);
                return res
                    .status(200)
                    .json({ message: "Famille supprimée avec succès🥰" });
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la suppression de la famille",
                    error,
                });
            }
        });
    }
}
exports.FamilleController = FamilleController;
//# sourceMappingURL=FamilleController.js.map