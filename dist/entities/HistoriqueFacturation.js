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
exports.HistoriqueFacturation = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const FactureArticle_1 = require("./FactureArticle");
const Devis_1 = require("./Devis");
const Article_1 = require("./Article");
let HistoriqueFacturation = class HistoriqueFacturation {
};
exports.HistoriqueFacturation = HistoriqueFacturation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], HistoriqueFacturation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HistoriqueFacturation.prototype, "factures_article_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HistoriqueFacturation.prototype, "devis_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HistoriqueFacturation.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HistoriqueFacturation.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], HistoriqueFacturation.prototype, "date_creation", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HistoriqueFacturation.prototype, "type_document", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], HistoriqueFacturation.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FactureArticle_1.FactureArticle),
    (0, typeorm_1.JoinColumn)({ name: "factures_article_id" }),
    __metadata("design:type", FactureArticle_1.FactureArticle)
], HistoriqueFacturation.prototype, "factureArticle", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Devis_1.Devis),
    (0, typeorm_1.JoinColumn)({ name: "devis_id" }),
    __metadata("design:type", Devis_1.Devis)
], HistoriqueFacturation.prototype, "devis", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], HistoriqueFacturation.prototype, "article", void 0);
exports.HistoriqueFacturation = HistoriqueFacturation = __decorate([
    (0, typeorm_1.Entity)("historique_facturation")
], HistoriqueFacturation);
//# sourceMappingURL=HistoriqueFacturation.js.map