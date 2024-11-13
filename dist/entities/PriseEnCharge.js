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
exports.PriseEnCharge = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const Article_1 = require("./Article");
const Machine_1 = require("./Machine");
const Vendeur_1 = require("./Vendeur");
const PriseEnChargeArticle_1 = require("./PriseEnChargeArticle");
let PriseEnCharge = class PriseEnCharge {
    constructor() {
        this.date = new Date();
    }
};
exports.PriseEnCharge = PriseEnCharge;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "article_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "machines_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "vendeurs_id", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "mot_de_passe_windows", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "symptome", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "batterie", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "chargeur", void 0);
__decorate([
    (0, typeorm_1.Column)("text", { nullable: true }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "accessoire", void 0);
__decorate([
    (0, typeorm_1.Column)("real"),
    __metadata("design:type", Number)
], PriseEnCharge.prototype, "prix_total", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["PEC", "Pret"],
    }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "statut", void 0);
__decorate([
    (0, typeorm_1.Column)("varchar", { nullable: true }),
    __metadata("design:type", String)
], PriseEnCharge.prototype, "signature_path", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", default: () => "CURRENT_DATE" }),
    __metadata("design:type", Object)
], PriseEnCharge.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], PriseEnCharge.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], PriseEnCharge.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Machine_1.Machine),
    (0, typeorm_1.JoinColumn)({ name: "machines_id" }),
    __metadata("design:type", Machine_1.Machine)
], PriseEnCharge.prototype, "machine", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendeur_1.Vendeur),
    (0, typeorm_1.JoinColumn)({ name: "vendeurs_id" }),
    __metadata("design:type", Vendeur_1.Vendeur)
], PriseEnCharge.prototype, "vendeur", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => PriseEnChargeArticle_1.PriseEnChargeArticle, (priseEnChargeArticle) => priseEnChargeArticle.priseEnCharge),
    __metadata("design:type", Array)
], PriseEnCharge.prototype, "priseEnChargeArticles", void 0);
exports.PriseEnCharge = PriseEnCharge = __decorate([
    (0, typeorm_1.Entity)("prises_en_charge")
], PriseEnCharge);
//# sourceMappingURL=PriseEnCharge.js.map