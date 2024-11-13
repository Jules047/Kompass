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
exports.HistoriqueFacturationAchatController = void 0;
const data_source_1 = require("../data-source");
const HistoriqueFacturationAchat_1 = require("../entities/HistoriqueFacturationAchat");
const Fournisseur_1 = require("../entities/Fournisseur");
const FactureAchat_1 = require("../entities/FactureAchat");
const Article_1 = require("../entities/Article");
const MoyenPaiement_1 = require("../entities/MoyenPaiement");
class HistoriqueFacturationAchatController {
    constructor() {
        this.historiqueRepository = data_source_1.AppDataSource.getRepository(HistoriqueFacturationAchat_1.HistoriqueFacturationAchat);
        this.fournisseurRepository = data_source_1.AppDataSource.getRepository(Fournisseur_1.Fournisseur);
        this.factureAchatRepository = data_source_1.AppDataSource.getRepository(FactureAchat_1.FactureAchat);
        this.articleRepository = data_source_1.AppDataSource.getRepository(Article_1.Article);
        this.moyenPaiementRepository = data_source_1.AppDataSource.getRepository(MoyenPaiement_1.MoyenPaiement);
    }
    getAllHistorique(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const historique = yield this.historiqueRepository.find({
                    relations: ["factureAchat", "fournisseur", "article", "factureAchat.moyenPaiement"]
                });
                const formattedHistorique = historique.map(entry => (Object.assign(Object.assign({}, entry), { montant_regle: entry.factureAchat.montant_regle, solde_du: entry.factureAchat.solde_du, moyens_paiement_id: entry.factureAchat.moyens_paiement_id })));
                const fournisseurs = yield this.fournisseurRepository.find();
                const facturesAchat = yield this.factureAchatRepository.find();
                const articles = yield this.articleRepository.find();
                const moyensPaiement = yield this.moyenPaiementRepository.find();
                response.json({
                    historique: formattedHistorique,
                    fournisseurs,
                    facturesAchat,
                    articles,
                    moyensPaiement
                });
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'historique:", error);
                response.status(500).json({ message: "Erreur lors de la récupération de l'historique", error });
            }
        });
    }
    getHistoriqueById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const historique = yield this.historiqueRepository.findOne({
                    where: { id },
                    relations: ["factureAchat", "fournisseur", "article", "factureAchat.moyenPaiement"]
                });
                if (historique) {
                    const formattedHistorique = Object.assign(Object.assign({}, historique), { montant_regle: historique.factureAchat.montant_regle, solde_du: historique.factureAchat.solde_du, moyens_paiement_id: historique.factureAchat.moyens_paiement_id });
                    response.json(formattedHistorique);
                }
                else {
                    response.status(404).json({ message: "Entrée d'historique non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de l'entrée d'historique:", error);
                response.status(500).json({ message: "Erreur lors de la récupération de l'entrée d'historique", error });
            }
        });
    }
}
exports.HistoriqueFacturationAchatController = HistoriqueFacturationAchatController;
//# sourceMappingURL=HistoriqueFacturationAchatController.js.map