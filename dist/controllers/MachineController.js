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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineController = void 0;
const data_source_1 = require("../data-source");
const Machine_1 = require("../entities/Machine");
class MachineController {
    constructor() {
        this.machineRepository = data_source_1.AppDataSource.getRepository(Machine_1.Machine);
    }
    createMachine(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const machine = this.machineRepository.create(request.body);
                yield this.machineRepository.save(machine);
                response.json({ message: "Machine créée", machine });
            }
            catch (error) {
                console.error("Erreur lors de la création de la machine:", error);
                response.status(500).json({ message: "Erreur lors de la création de la machine", error });
            }
        });
    }
    getAllMachines(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const machines = yield this.machineRepository.find();
                response.json(machines);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des machines:", error);
                response.status(500).json({ message: "Erreur lors de la récupération des machines", error });
            }
        });
    }
    getMachineById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const machine = yield this.machineRepository.findOne({ where: { id } });
                if (machine) {
                    response.json(machine);
                }
                else {
                    response.status(404).json({ message: "Machine non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de la machine:", error);
                response.status(500).json({ message: "Erreur lors de la récupération de la machine", error });
            }
        });
    }
    updateMachine(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const machine = yield this.machineRepository.findOne({ where: { id } });
                if (!machine) {
                    return response.status(404).json({ message: "Machine non trouvée" });
                }
                this.machineRepository.merge(machine, request.body);
                yield this.machineRepository.save(machine);
                return response.json({ message: "Machine mise à jour", machine });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour de la machine:", error);
                return response.status(500).json({ message: "Erreur lors de la mise à jour de la machine", error });
            }
        });
    }
    deleteMachine(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const machine = yield this.machineRepository.findOne({ where: { id } });
                if (!machine) {
                    return response.status(404).json({ message: "Machine non trouvée" });
                }
                yield this.machineRepository.remove(machine);
                return response.json({ message: "Machine supprimée" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression de la machine:", error);
                return response.status(500).json({ message: "Erreur lors de la suppression de la machine", error });
            }
        });
    }
}
exports.MachineController = MachineController;
//# sourceMappingURL=MachineController.js.map