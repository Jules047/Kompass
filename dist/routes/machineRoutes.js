"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MachineController_1 = require("../controllers/MachineController");
const router = (0, express_1.Router)();
const machineController = new MachineController_1.MachineController();
router.post('/machines', machineController.createMachine.bind(machineController));
router.get('/machines', machineController.getAllMachines.bind(machineController));
router.get('/machines/:id', machineController.getMachineById.bind(machineController));
router.put('/machines/:id', machineController.updateMachine.bind(machineController));
router.delete('/machines/:id', machineController.deleteMachine.bind(machineController));
exports.default = router;
//# sourceMappingURL=machineRoutes.js.map