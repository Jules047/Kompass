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
exports.Article = void 0;
const typeorm_1 = require("typeorm");
const Famille_1 = require("./Famille");
const Stock_1 = require("./Stock");
const Sousfamille_1 = require("./Sousfamille");
let Article = class Article {
};
exports.Article = Article;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Article.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Article.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Article.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Article.prototype, "prix_achat", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Article.prototype, "prix_ht", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Article.prototype, "marge_pourcent", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Article.prototype, "marge_num", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Article.prototype, "prix_ttc", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Article.prototype, "complet", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Article.prototype, "famille_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Famille_1.Famille, (famille) => famille.articles),
    (0, typeorm_1.JoinColumn)({ name: "famille_id" }),
    __metadata("design:type", Famille_1.Famille)
], Article.prototype, "famille", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Stock_1.Stock, (stock) => stock.article),
    __metadata("design:type", Array)
], Article.prototype, "stocks", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Sousfamille_1.Sousfamille, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "sousfamille_id" }),
    __metadata("design:type", Sousfamille_1.Sousfamille)
], Article.prototype, "sousfamille", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Article.prototype, "sousfamille_id", void 0);
exports.Article = Article = __decorate([
    (0, typeorm_1.Entity)("articles")
], Article);
//# sourceMappingURL=Article.js.map