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
exports.CommandeArticle = void 0;
const typeorm_1 = require("typeorm");
const Commande_1 = require("./Commande");
const Article_1 = require("./Article");
let CommandeArticle = class CommandeArticle {
    push(commandeArticle) {
        throw new Error("Method not implemented.");
    }
};
exports.CommandeArticle = CommandeArticle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommandeArticle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommandeArticle.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Commande_1.Commande, (commande) => commande.commandeArticles, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "commande_id" }),
    __metadata("design:type", Commande_1.Commande)
], CommandeArticle.prototype, "commande", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], CommandeArticle.prototype, "article", void 0);
exports.CommandeArticle = CommandeArticle = __decorate([
    (0, typeorm_1.Entity)("commande_article")
], CommandeArticle);
//# sourceMappingURL=CommandeArticle.js.map