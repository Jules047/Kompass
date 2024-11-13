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
exports.Stock = void 0;
const typeorm_1 = require("typeorm");
const Article_1 = require("./Article");
const FactureAchat_1 = require("./FactureAchat");
let Stock = class Stock {
};
exports.Stock = Stock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Stock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Stock.prototype, "articles_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Stock.prototype, "entree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "decimal", precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Stock.prototype, "sortie", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "decimal",
        precision: 10,
        scale: 2,
        generatedType: "STORED",
        asExpression: "entree - sortie",
    }),
    __metadata("design:type", Number)
], Stock.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "boolean",
        generatedType: "STORED",
        asExpression: "(SELECT SUM(s.entree) - SUM(s.sortie) <= 2 FROM stocks s WHERE s.articles_id = articles_id)",
    }),
    __metadata("design:type", Boolean)
], Stock.prototype, "is_low_stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], Stock.prototype, "date_entree", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], Stock.prototype, "date_sortie", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, (article) => article.stocks),
    (0, typeorm_1.JoinColumn)({ name: "articles_id" }),
    __metadata("design:type", Article_1.Article)
], Stock.prototype, "article", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FactureAchat_1.FactureAchat, factureAchat => factureAchat.stocks, {
        onDelete: "CASCADE"
    }),
    (0, typeorm_1.JoinColumn)({ name: "facture_achat_id" }),
    __metadata("design:type", FactureAchat_1.FactureAchat)
], Stock.prototype, "factureAchat", void 0);
exports.Stock = Stock = __decorate([
    (0, typeorm_1.Entity)("stocks")
], Stock);
//# sourceMappingURL=Stock.js.map