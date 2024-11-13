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
exports.ServiceApresVente = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const Machine_1 = require("./Machine");
let ServiceApresVente = class ServiceApresVente {
};
exports.ServiceApresVente = ServiceApresVente;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ServiceApresVente.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServiceApresVente.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ServiceApresVente.prototype, "code_machines", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], ServiceApresVente.prototype, "date_recuperation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], ServiceApresVente.prototype, "date_restitution", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", nullable: true }),
    __metadata("design:type", Date)
], ServiceApresVente.prototype, "date_rendu", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["Cloturé", "Pret", "Restitué"],
    }),
    __metadata("design:type", String)
], ServiceApresVente.prototype, "etat", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], ServiceApresVente.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Machine_1.Machine),
    (0, typeorm_1.JoinColumn)({ name: "code_machines" }),
    __metadata("design:type", Machine_1.Machine)
], ServiceApresVente.prototype, "machine", void 0);
exports.ServiceApresVente = ServiceApresVente = __decorate([
    (0, typeorm_1.Entity)("service_apres_vente")
], ServiceApresVente);
//# sourceMappingURL=ServiceApresVente.js.map