"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientController = void 0;
const data_source_1 = require("../data-source");
const Client_1 = require("../entities/Client");
const Segmentation_1 = require("../entities/Segmentation");
class ClientController {
    constructor() {
        this.clientRepository = data_source_1.AppDataSource.getRepository(Client_1.Client);
        this.segmentationRepository = data_source_1.AppDataSource.getRepository(Segmentation_1.Segmentation);
    }
    createClient(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const _a = request.body, { segment_id } = _a, clientData = __rest(_a, ["segment_id"]);
                const segment = yield this.segmentationRepository.findOne({
                    where: { id: segment_id },
                });
                if (!segment) {
                    response.status(404).json({ message: "Segment non trouvé" });
                    return;
                }
                const client = this.clientRepository.create(Object.assign(Object.assign({}, clientData), { segment_id,
                    segment }));
                yield this.clientRepository.save(client);
                response.json({ message: "Client créé", client });
            }
            catch (error) {
                console.error("Erreur lors de la création du client:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la création du client", error });
            }
        });
    }
    getAllClients(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clients = yield this.clientRepository.find({
                    relations: ["segment"],
                });
                response.json(clients);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des clients:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération des clients", error });
            }
        });
    }
    getClientById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const client = yield this.clientRepository.findOne({
                    where: { id, actif: true },
                    relations: ["segment"],
                });
                if (client) {
                    response.json(client);
                }
                else {
                    response.status(404).json({ message: "Client non trouvé ou inactif" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération du client:", error);
                response
                    .status(500)
                    .json({ message: "Erreur lors de la récupération du client", error });
            }
        });
    }
    updateClient(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const _a = request.body, { segment_id } = _a, clientData = __rest(_a, ["segment_id"]);
                const client = yield this.clientRepository.findOne({
                    where: { id },
                    relations: ["segment"],
                });
                if (!client) {
                    return response.status(404).json({ message: "Client non trouvé" });
                }
                if (segment_id) {
                    const segment = yield this.segmentationRepository.findOne({
                        where: { id: segment_id },
                    });
                    if (!segment) {
                        return response.status(404).json({ message: "Segment non trouvé" });
                    }
                    client.segment = segment;
                    client.segment_id = segment_id;
                }
                Object.assign(client, clientData);
                yield this.clientRepository.save(client);
                return response.json({ message: "Client mis à jour", client });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour du client:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la mise à jour du client", error });
            }
        });
    }
    deleteClient(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const client = yield this.clientRepository.findOne({ where: { id } });
                if (!client) {
                    return response.status(404).json({ message: "Client non trouvé" });
                }
                yield this.clientRepository.remove(client);
                return response.json({ message: "Client supprimé" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression du client:", error);
                return response
                    .status(500)
                    .json({ message: "Erreur lors de la suppression du client", error });
            }
        });
    }
}
exports.ClientController = ClientController;
//# sourceMappingURL=ClientController.js.map