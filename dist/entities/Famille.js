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
exports.Famille = void 0;
const typeorm_1 = require("typeorm");
const Article_1 = require("./Article");
const Sousfamille_1 = require("./Sousfamille");
let Famille = class Famille {
};
exports.Famille = Famille;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Famille.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Famille.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)("decimal", { precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Famille.prototype, "tva", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Article_1.Article, (article) => article.famille),
    __metadata("design:type", Array)
], Famille.prototype, "articles", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => Sousfamille_1.Sousfamille, (sousfamille) => sousfamille.famille),
    __metadata("design:type", Array)
], Famille.prototype, "sousfamilles", void 0);
exports.Famille = Famille = __decorate([
    (0, typeorm_1.Entity)("familles")
], Famille);
//# sourceMappingURL=Famille.js.map