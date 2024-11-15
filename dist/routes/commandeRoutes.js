"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommandeController_1 = require("../controllers/CommandeController");
const router = (0, express_1.Router)();
const commandeController = new CommandeController_1.CommandeController();
router.put('/commandes', commandeController.creerCommande.bind(commandeController));
router.get('/commandes', commandeController.obtenirToutesLesCommandes.bind(commandeController));
router.get('/commandes/:id', commandeController.obtenirCommandeParId.bind(commandeController));
router.patch('/commandes/:id', commandeController.mettreAJourCommande.bind(commandeController));
router.delete('/commandes/:id', commandeController.supprimerCommande.bind(commandeController));
router.patch('/commandes/:id/annuler', commandeController.annulerCommande.bind(commandeController));
router.get('/commandes/annulees', commandeController.obtenirCommandesAnnulees.bind(commandeController));
router.patch('/commandes/:id/description', commandeController.mettreAJourDescription.bind(commandeController));
router.post('/commandes/annulees', commandeController.obtenirCommandesAnnulees.bind(commandeController));
router.patch('/commandes/:id/restaurer', commandeController.restaurerCommande.bind(commandeController));
router.post('/commandes/:id/signature', commandeController.uploadSignature.bind(commandeController));
router.get('/commandes/:id/pdf', commandeController.generatePDF.bind(commandeController));
exports.default = router;
//# sourceMappingURL=commandeRoutes.js.map