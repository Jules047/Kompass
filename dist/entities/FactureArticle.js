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
exports.FactureArticle = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const MoyenPaiement_1 = require("./MoyenPaiement");
const FactureArticleDetail_1 = require("./FactureArticleDetail");
let FactureArticle = class FactureArticle {
};
exports.FactureArticle = FactureArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FactureArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FactureArticle.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FactureArticle.prototype, "moyens_paiement_id", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], FactureArticle.prototype, "commentaire", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureArticle.prototype, "montant_initial", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureArticle.prototype, "montant_regle", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], FactureArticle.prototype, "solde_du", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], FactureArticle.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Approuvée", "En cours", "Payée"],
    }),
    __metadata("design:type", String)
], FactureArticle.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], FactureArticle.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MoyenPaiement_1.MoyenPaiement),
    (0, typeorm_1.JoinColumn)({ name: "moyens_paiement_id" }),
    __metadata("design:type", MoyenPaiement_1.MoyenPaiement)
], FactureArticle.prototype, "moyenPaiement", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FactureArticleDetail_1.FactureArticleDetail, (detail) => detail.factureArticle, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], FactureArticle.prototype, "factureArticleDetails", void 0);
exports.FactureArticle = FactureArticle = __decorate([
    (0, typeorm_1.Entity)("factures_article")
], FactureArticle);
//# sourceMappingURL=FactureArticle.js.map