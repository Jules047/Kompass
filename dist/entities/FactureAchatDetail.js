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
exports.FactureAchatDetail = void 0;
const typeorm_1 = require("typeorm");
const FactureAchat_1 = require("./FactureAchat");
const Article_1 = require("./Article");
let FactureAchatDetail = class FactureAchatDetail {
};
exports.FactureAchatDetail = FactureAchatDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FactureAchatDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FactureAchatDetail.prototype, "quantite", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => FactureAchat_1.FactureAchat, (facture) => facture.factureAchatDetails, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "facture_achat_id" }),
    __metadata("design:type", FactureAchat_1.FactureAchat)
], FactureAchatDetail.prototype, "factureAchat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Article_1.Article, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: "article_id" }),
    __metadata("design:type", Article_1.Article)
], FactureAchatDetail.prototype, "article", void 0);
exports.FactureAchatDetail = FactureAchatDetail = __decorate([
    (0, typeorm_1.Entity)("facture_achat_detail")
], FactureAchatDetail);
//# sourceMappingURL=FactureAchatDetail.js.map