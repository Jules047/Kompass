import { Router } from 'express';
import { MachineController } from '../controllers/MachineController';

const router = Router();
const machineController = new MachineController();

router.post('/machines', machineController.createMachine.bind(machineController));
router.get('/machines', machineController.getAllMachines.bind(machineController));
router.get('/machines/:id', machineController.getMachineById.bind(machineController));
router.put('/machines/:id', machineController.updateMachine.bind(machineController));
router.delete('/machines/:id', machineController.deleteMachine.bind(machineController));

export default router;
