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
exports.Devis = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const MoyenPaiement_1 = require("./MoyenPaiement");
const DevisArticle_1 = require("./DevisArticle");
let Devis = class Devis {
};
exports.Devis = Devis;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Devis.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Devis.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Devis.prototype, "moyens_paiement_id", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Devis.prototype, "commentaire", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], Devis.prototype, "tarif", void 0);
__decorate([
    (0, typeorm_1.Column)("real", { default: 0 }),
    __metadata("design:type", Number)
], Devis.prototype, "acompte", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], Devis.prototype, "reste_payer", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], Devis.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    __metadata("design:type", String)
], Devis.prototype, "signature_path", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], Devis.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DevisArticle_1.DevisArticle, (devisArticle) => devisArticle.devis, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Devis.prototype, "devisArticles", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => MoyenPaiement_1.MoyenPaiement),
    (0, typeorm_1.JoinColumn)({ name: "moyens_paiement_id" }),
    __metadata("design:type", MoyenPaiement_1.MoyenPaiement)
], Devis.prototype, "moyenPaiement", void 0);
exports.Devis = Devis = __decorate([
    (0, typeorm_1.Entity)("devis")
], Devis);
//# sourceMappingURL=Devis.js.map