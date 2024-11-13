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
exports.HistoriqueFacturationAchat = void 0;
const typeorm_1 = require("typeorm");
const FactureAchat_1 = require("./FactureAchat");
const Fournisseur_1 = require("./Fournisseur");
const Article_1 = require("./Article");
let HistoriqueFacturationAchat = class HistoriqueFacturationAchat {
};
exports.HistoriqueFacturationAchat = HistoriqueFacturationAchat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HistoriqueFacturationAchat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HistoriqueFacturationAchat.prototype, "factures_achat_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HistoriqueFacturationAchat.prototype, "fournisseurs_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HistoriqueFacturationAchat.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], HistoriqueFacturationAchat.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FactureAchat_1.FactureAchat),
    (0, typeorm_1.JoinColumn)({ name: "factures_achat_id" }),
    __metadata("design:type", FactureAchat_1.FactureAchat)
], HistoriqueFacturationAchat.prototype, "factureAchat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Fournisseur_1.Fournisseur),
    (0, typeorm_1.JoinColumn)({ name: "fournisseurs_id" }),
    __metadata("design:type", Fournisseur_1.Fournisseur)
], HistoriqueFacturationAchat.prototype, "fournisseur", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], HistoriqueFacturationAchat.prototype, "article", void 0);
exports.HistoriqueFacturationAchat = HistoriqueFacturationAchat = __decorate([
    (0, typeorm_1.Entity)("historique_facturation_achat")
], HistoriqueFacturationAchat);
//# sourceMappingURL=HistoriqueFacturationAchat.js.map