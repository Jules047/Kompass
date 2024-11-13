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
exports.PriseEnChargeArticle = void 0;
const typeorm_1 = require("typeorm");
const PriseEnCharge_1 = require("./PriseEnCharge");
const Article_1 = require("./Article");
let PriseEnChargeArticle = class PriseEnChargeArticle {
};
exports.PriseEnChargeArticle = PriseEnChargeArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PriseEnChargeArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnChargeArticle.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriseEnCharge_1.PriseEnCharge, (priseEnCharge) => priseEnCharge.priseEnChargeArticles, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "prise_en_charge_id" }),
    __metadata("design:type", PriseEnCharge_1.PriseEnCharge)
], PriseEnChargeArticle.prototype, "priseEnCharge", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnChargeArticle.prototype, "prise_en_charge_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], PriseEnChargeArticle.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], PriseEnChargeArticle.prototype, "article_id", void 0);
exports.PriseEnChargeArticle = PriseEnChargeArticle = __decorate([
    (0, typeorm_1.Entity)("prise_en_charge_article")
], PriseEnChargeArticle);
//# sourceMappingURL=PriseEnChargeArticle.js.map