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
exports.Ticket = void 0;
const typeorm_1 = require("typeorm");
const Client_1 = require("./Client");
const PriseEnCharge_1 = require("./PriseEnCharge");
const Vendeur_1 = require("./Vendeur");
let Ticket = class Ticket {
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ticket.prototype, "clients_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ticket.prototype, "prises_en_charge_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Ticket.prototype, "vendeurs_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 5 }),
    __metadata("design:type", String)
], Ticket.prototype, "blocage", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Ticket.prototype, "urgence", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], Ticket.prototype, "accessoire", void 0);
__decorate([
    (0, typeorm_1.Column)("text"),
    __metadata("design:type", String)
], Ticket.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30 }),
    __metadata("design:type", String)
], Ticket.prototype, "perimetre_panne", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 30, default: 'En attente' }),
    __metadata("design:type", String)
], Ticket.prototype, "secteur_panne", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ['En cours', 'En attente', 'Terminer', 'En pausse', 'En Clôture'],
    }),
    __metadata("design:type", String)
], Ticket.prototype, "statut_panne", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ['Réseau', 'Hardware', 'Software'],
    }),
    __metadata("design:type", String)
], Ticket.prototype, "etat", void 0);
__decorate([
    (0, typeorm_1.Column)("date"),
    __metadata("design:type", Date)
], Ticket.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Client_1.Client),
    (0, typeorm_1.JoinColumn)({ name: "clients_id" }),
    __metadata("design:type", Client_1.Client)
], Ticket.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => PriseEnCharge_1.PriseEnCharge),
    (0, typeorm_1.JoinColumn)({ name: "prises_en_charge_id" }),
    __metadata("design:type", PriseEnCharge_1.PriseEnCharge)
], Ticket.prototype, "priseEnCharge", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Vendeur_1.Vendeur),
    (0, typeorm_1.JoinColumn)({ name: "vendeurs_id" }),
    __metadata("design:type", Vendeur_1.Vendeur)
], Ticket.prototype, "vendeur", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)("ticket")
], Ticket);
//# sourceMappingURL=Ticket.js.map