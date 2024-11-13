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
exports.Sousfamille = void 0;
const typeorm_1 = require("typeorm");
const Famille_1 = require("./Famille");
let Sousfamille = class Sousfamille {
};
exports.Sousfamille = Sousfamille;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sousfamille.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: false }),
    __metadata("design:type", String)
], Sousfamille.prototype, "designation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "famille_id" }),
    __metadata("design:type", Number)
], Sousfamille.prototype, "familleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Famille_1.Famille, (famille) => famille.sousfamilles, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "famille_id" }),
    __metadata("design:type", Famille_1.Famille)
], Sousfamille.prototype, "famille", void 0);
exports.Sousfamille = Sousfamille = __decorate([
    (0, typeorm_1.Entity)("sousfamilles")
], Sousfamille);
//# sourceMappingURL=Sousfamille.js.map