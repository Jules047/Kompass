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
exports.SousfamilleController = void 0;
const Sousfamille_1 = require("../entities/Sousfamille");
const Famille_1 = require("../entities/Famille");
const data_source_1 = require("../data-source");
const sousfamilleRepository = data_source_1.AppDataSource.getRepository(Sousfamille_1.Sousfamille);
const familleRepository = data_source_1.AppDataSource.getRepository(Famille_1.Famille);
class SousfamilleController {
    static createSousfamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { designation, familleId } = req.body;
            if (!designation || !familleId) {
                return res.status(400).json({
                    message: "Les champs désignation et familleId sont obligatoires.",
                });
            }
            try {
                const famille = yield familleRepository.findOneBy({ id: familleId });
                if (!famille) {
                    return res.status(404).json({ message: "Famille non trouvée" });
                }
                const newSousfamille = sousfamilleRepository.create({
                    designation,
                    famille,
                });
                yield sousfamilleRepository.save(newSousfamille);
                return res.status(201).json(newSousfamille);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la création de la sous-famille",
                    error,
                });
            }
        });
    }
    static getAllSousfamilles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const sousfamilles = yield sousfamilleRepository.find({
                    relations: ["famille"],
                });
                return res.status(200).json(sousfamilles);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la récupération des sous-familles",
                    error,
                });
            }
        });
    }
    static getSousfamilleById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const sousfamille = yield sousfamilleRepository.findOne({
                    where: { id: parseInt(id, 10) },
                    relations: ["famille"],
                });
                if (!sousfamille) {
                    return res.status(404).json({ message: "Sous-famille non trouvée" });
                }
                return res.status(200).json(sousfamille);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la récupération de la sous-famille",
                    error,
                });
            }
        });
    }
    static updateSousfamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { designation, familleId } = req.body;
            try {
                const sousfamille = yield sousfamilleRepository.findOne({
                    where: { id: parseInt(id, 10) },
                    relations: ["famille"],
                });
                if (!sousfamille) {
                    return res.status(404).json({ message: "Sous-famille non trouvée" });
                }
                if (familleId) {
                    const famille = yield familleRepository.findOneBy({ id: familleId });
                    if (!famille) {
                        return res.status(404).json({ message: "Famille non trouvée" });
                    }
                    sousfamille.famille = famille;
                }
                sousfamille.designation = designation || sousfamille.designation;
                yield sousfamilleRepository.save(sousfamille);
                return res.status(200).json(sousfamille);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la mise à jour de la sous-famille",
                    error,
                });
            }
        });
    }
    static deleteSousfamille(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const sousfamille = yield sousfamilleRepository.findOneBy({
                    id: parseInt(id, 10),
                });
                if (!sousfamille) {
                    return res.status(404).json({ message: "Sous-famille non trouvée" });
                }
                yield sousfamilleRepository.remove(sousfamille);
                return res
                    .status(200)
                    .json({ message: "Sous-famille supprimée avec succès🥰" });
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la suppression de la sous-famille",
                    error,
                });
            }
        });
    }
    static getSousfamillesByFamilleId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { familleId } = req.params;
            try {
                const sousfamilles = yield sousfamilleRepository.find({
                    where: { famille: { id: parseInt(familleId, 10) } },
                    relations: ["famille"],
                });
                return res.status(200).json(sousfamilles);
            }
            catch (error) {
                return res.status(500).json({
                    message: "Erreur lors de la récupération des sous-familles",
                    error,
                });
            }
        });
    }
}
exports.SousfamilleController = SousfamilleController;
//# sourceMappingURL=SousfamilleController.js.map