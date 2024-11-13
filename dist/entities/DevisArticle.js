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
exports.DevisArticle = void 0;
const typeorm_1 = require("typeorm");
const Devis_1 = require("./Devis");
const Article_1 = require("./Article");
let DevisArticle = class DevisArticle {
};
exports.DevisArticle = DevisArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DevisArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], DevisArticle.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Devis_1.Devis, (devis) => devis.devisArticles),
    (0, typeorm_1.JoinColumn)({ name: "devis_id" }),
    __metadata("design:type", Devis_1.Devis)
], DevisArticle.prototype, "devis", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], DevisArticle.prototype, "article", void 0);
exports.DevisArticle = DevisArticle = __decorate([
    (0, typeorm_1.Entity)("devis_article")
], DevisArticle);
//# sourceMappingURL=DevisArticle.js.map