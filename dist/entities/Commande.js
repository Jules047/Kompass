"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commande = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const MoyenPaiement_1 = require("./MoyenPaiement");
const CommandeArticle_1 = require("./CommandeArticle");
let Commande = class Commande {
};
exports.Commande = Commande;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Commande.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Commande.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Commande.prototype, "moyens_paiement_id", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], Commande.prototype, "tarif", void 0);
__decorate([
    (0, typeorm_1.Column)("real", { default: 0 }),
    __metadata("design:type", Number)
], Commande.prototype, "acompte", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], Commande.prototype, "reste_payer", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Commande.prototype, "commentaire", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], Commande.prototype, "date_creation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], Commande.prototype, "date_commande", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], Commande.prototype, "date_arrivee", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Commande.prototype, "signature_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: false }),
    __metadata("design:type", Boolean)
], Commande.prototype, "annulee", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Commande.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Commande.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], Commande.prototype, "date_annulation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], Commande.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MoyenPaiement_1.MoyenPaiement),
    (0, typeorm_1.JoinColumn)({ name: "moyens_paiement_id" }),
    __metadata("design:type", MoyenPaiement_1.MoyenPaiement)
], Commande.prototype, "moyenPaiement", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CommandeArticle_1.CommandeArticle, (commandeArticle) => commandeArticle.commande, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Commande.prototype, "commandeArticles", void 0);
exports.Commande = Commande = __decorate([
    (0, typeorm_1.Entity)("commandes")
], Commande);
//# sourceMappingURL=Commande.js.map