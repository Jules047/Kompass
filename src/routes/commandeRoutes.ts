import { Router } from 'express';
import { CommandeController } from '../controllers/CommandeController';

const router = Router();
const commandeController = new CommandeController();

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

export default router;
