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
exports.HistoriqueFacturationController = void 0;
const data_source_1 = require("../data-source");
const HistoriqueFacturation_1 = require("../entities/HistoriqueFacturation");
class HistoriqueFacturationController {
    constructor() {
        this.historiqueRepository = data_source_1.AppDataSource.getRepository(HistoriqueFacturation_1.HistoriqueFacturation);
    }
    getAllHistorique(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const historique = yield this.historiqueRepository.find({
                    relations: {
                        client: true,
                        factureArticle: true,
                        devis: true,
                        article: true,
                    },
                    order: {
                        date_creation: "DESC",
                    },
                });
                response.json({ historique });
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'historique:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération de l'historique" });
            }
        });
    }
}
exports.HistoriqueFacturationController = HistoriqueFacturationController;
//# sourceMappingURL=HistoriqueFacturationController.js.map