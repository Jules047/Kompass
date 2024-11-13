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
exports.SegmentationController = void 0;
const data_source_1 = require("../data-source");
const Segmentation_1 = require("../entities/Segmentation");
class SegmentationController {
    constructor() {
        this.segmentationRepository = data_source_1.AppDataSource.getRepository(Segmentation_1.Segmentation);
    }
    createSegmentation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { nom, commentaire } = request.body;
                const segmentation = this.segmentationRepository.create({ nom, commentaire });
                yield this.segmentationRepository.save(segmentation);
                response.json({ message: "Segmentation créée", segmentation });
            }
            catch (error) {
                console.error("Erreur lors de la création de la segmentation:", error);
                response.status(500).json({ message: "Erreur lors de la création de la segmentation", error });
            }
        });
    }
    getAllSegmentations(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const segmentations = yield this.segmentationRepository.find();
                response.json(segmentations);
            }
            catch (error) {
                console.error("Erreur lors de la récupération des segmentations:", error);
                response.status(500).json({ message: "Erreur lors de la récupération des segmentations", error });
            }
        });
    }
    getSegmentationById(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const segmentation = yield this.segmentationRepository.findOne({ where: { id } });
                if (segmentation) {
                    response.json(segmentation);
                }
                else {
                    response.status(404).json({ message: "Segmentation non trouvée" });
                }
            }
            catch (error) {
                console.error("Erreur lors de la récupération de la segmentation:", error);
                response.status(500).json({ message: "Erreur lors de la récupération de la segmentation", error });
            }
        });
    }
    updateSegmentation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const segmentation = yield this.segmentationRepository.findOne({ where: { id } });
                if (!segmentation) {
                    return response.status(404).json({ message: "Segmentation non trouvée" });
                }
                const updatedSegmentation = Object.assign(segmentation, request.body);
                yield this.segmentationRepository.save(updatedSegmentation);
                return response.json({ message: "Segmentation mise à jour", segmentation: updatedSegmentation });
            }
            catch (error) {
                console.error("Erreur lors de la mise à jour de la segmentation:", error);
                return response.status(500).json({ message: "Erreur lors de la mise à jour de la segmentation", error });
            }
        });
    }
    deleteSegmentation(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = parseInt(request.params.id);
                const segmentation = yield this.segmentationRepository.findOne({ where: { id } });
                if (!segmentation) {
                    return response.status(404).json({ message: "Segmentation non trouvée" });
                }
                yield this.segmentationRepository.remove(segmentation);
                return response.json({ message: "Segmentation supprimée" });
            }
            catch (error) {
                console.error("Erreur lors de la suppression de la segmentation:", error);
                return response.status(500).json({ message: "Erreur lors de la suppression de la segmentation", error });
            }
        });
    }
}
exports.SegmentationController = SegmentationController;
//# sourceMappingURL=SegmentationController.js.map