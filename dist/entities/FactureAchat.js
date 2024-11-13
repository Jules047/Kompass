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
exports.FactureAchat = void 0;
const typeorm_1 = require("typeorm");
const Fournisseur_1 = require("./Fournisseur");
const MoyenPaiement_1 = require("./MoyenPaiement");
const FactureAchatDetail_1 = require("./FactureAchatDetail");
const Article_1 = require("./Article");
const Stock_1 = require("./Stock");
let FactureAchat = class FactureAchat {
};
exports.FactureAchat = FactureAchat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FactureAchat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Fournisseur_1.Fournisseur),
    (0, typeorm_1.JoinColumn)({ name: "fournisseurs_id" }),
    __metadata("design:type", Fournisseur_1.Fournisseur)
], FactureAchat.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FactureAchat.prototype, "fournisseurs_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], FactureAchat.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FactureAchat.prototype, "commentaire", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], FactureAchat.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureAchat.prototype, "montant_regle", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureAchat.prototype, "solde_du", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureAchat.prototype, "prix_total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MoyenPaiement_1.MoyenPaiement),
    (0, typeorm_1.JoinColumn)({ name: "moyens_paiement_id" }),
    __metadata("design:type", MoyenPaiement_1.MoyenPaiement)
], FactureAchat.prototype, "moyenPaiement", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FactureAchat.prototype, "moyens_paiement_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FactureAchatDetail_1.FactureAchatDetail, (detail) => detail.factureAchat, {
        cascade: true,
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], FactureAchat.prototype, "factureAchatDetails", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], FactureAchat.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Stock_1.Stock, (stock) => stock.factureAchat, {
        cascade: true,
        onDelete: "CASCADE",
    }),
    __metadata("design:type", Array)
], FactureAchat.prototype, "stocks", void 0);
exports.FactureAchat = FactureAchat = __decorate([
    (0, typeorm_1.Entity)("factures_achat")
], FactureAchat);
//# sourceMappingURL=FactureAchat.js.map