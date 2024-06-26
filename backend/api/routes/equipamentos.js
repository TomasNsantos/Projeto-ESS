const router = require('express').Router();
const equipamentoInjector = require('../../di/equipamentoInjector');

const EquipamentosController = require('../controllers/equipamentosController');
const EquipamentosService = require('../services/equipamentosService');
const EquipamentosRepository = require('../repositories/equipamentosRepository');

let injector = new equipamentoInjector();


injector.registerEquipmentRepository(EquipamentosRepository, new EquipamentosRepository());

injector.registerEquipmentService(EquipamentosService, new EquipamentosService(
    injector.getEquipmentRepository(EquipamentosRepository)
));
equipamentosController = new EquipamentosController(injector.getEquipmentService(EquipamentosService));


module.exports = app => {
    app.use('/equipamentos', router);
    router.get('/', equipamentosController.getAllEquipments);
    router.get('/id/:id', equipamentosController.getEquipmentById);
    router.get('/patrimonio/:patrimonio', equipamentosController.getEquipmentByPatrimonio);
    router.get('/numero_serie/:numero_serie', equipamentosController.getEquipmentBySN);
    router.post('/patrimonio/', equipamentosController.createEquipmentPatrimonio);
    router.post('/numero_serie/', equipamentosController.createEquipmentSN);
    router.patch('/:id', equipamentosController.patchEquipment);
    router.delete('/:id', equipamentosController.deleteEquipment);
}
