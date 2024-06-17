const equipamentoSNModel = require('../models/equipamentoSNModel');
const equipamentoPatrimonioModel = require('../models/equipamentoPatrimonioModel');
const EquipamentosService = require('../services/equipamentosService');
const shortid = require('shortid');

class EquipamentosController {

    constructor(equipamentosService){
        this.equipamentosService = equipamentosService;
        this.getAllEquipments = this.getAllEquipments.bind(this);
        this.getEquipmentById = this.getEquipmentById.bind(this);
        this.getEquipmentByPatrimonio = this.getEquipmentByPatrimonio.bind(this);
        this.getEquipmentBySN = this.getEquipmentBySN.bind(this);
        this.createEquipment = this.createEquipment.bind(this);
        this.patchEquipment = this.patchEquipment.bind(this);
        this.deleteEquipment = this.deleteEquipment.bind(this);
    }

     async getAllEquipments(req, res) {
        try{
            const equipments = await this.equipamentosService.getAllEquipments();
            if(equipments.length === 0){
                console.log('GET /equipamentos [404] NOT FOUND');
                return res.status(404).send({message: 'Nenhum equipamento cadastrado'});
            }
            console.log('GET /equipamentos [200] OK');
            res.status(200).send(equipments);
        } catch (error) {
            console.log(`GET /equipamentos [500] INTERNAL SERVER ERROR\n ${error}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    };

     async getEquipmentById(req, res) {
        try{
            const id = req.params.id;
            const equipment = await this.equipamentosService.getEquipmentById(id);
            if(equipment){
                console.log(`GET /equipamentos/:${id} by ID [200] OK`);
                res.status(200).send(equipment);
            } else {
                console.log(`GET /equipamentos/:${id} by ID [404] NOT FOUND`);
                res.status(404).send({message: 'Equipamento não encontrado'});
            }
        } catch (error) {
            console.log(`GET /equipamentos/:${id} [500] INTERNAL SERVER ERROR\n ${error.message}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    };

    async getEquipmentByPatrimonio(req, res) {
        try{
            const patrimonio = req.params.patrimonio;
            const equipment = await this.equipamentosService.getEquipmentByPatrimonio(patrimonio);
            if(equipment){
                console.log(`GET /equipamentos/patrimonio/:${patrimonio} [200] OK`);
                res.status(200).send(equipment);
            } else {
                console.log(`GET /equipamentos/patrimonio/:${patrimonio} [404] NOT FOUND`);
                res.status(404).send({message: 'Equipamento não encontrado'});
            }
        } catch (error) {
            console.log(`GET /equipamentos/patrimonio/:${req.params.patrimonio} [500] INTERNAL SERVER ERROR\n ${error.message}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    };

    async getEquipmentBySN(req, res) {
        try{
            const sn = req.params.numero_serie;
            const equipment = await this.equipamentosService.getEquipmentBySerie(sn);
            if(equipment){
                console.log(`GET /equipamentos/:${equipment.numero_serie} [200] OK`);
                res.status(200).send(equipment);
            } else {
                console.log(`GET /equipamentos/:${equipment.numero_serie} [404] NOT FOUND`);
                res.status(404).send({message: 'Equipamento não encontrado'});
            }
        } catch (error) {
            console.log(`GET /equipamentos/:${equipment.numero_serie} [500] INTERNAL SERVER ERROR\n ${error.message}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    };

    async createEquipment(req, res) {
        try{
            const {nome, descricao, estado_conservacao, data_aquisicao, valor_estimado, identificador} = req.body;
            if (!nome || !descricao || !estado_conservacao || !data_aquisicao || !valor_estimado || !identificador.type || !identificador.value) {
                console.log(`POST /equipamentos [400] BAD REQUEST`);
                if (!nome) {
                    res.status(400).send({message: 'Nome não informado'});
                } else if (!descricao) {
                    res.status(400).send({message: 'Descrição não informada'});
                } else if (!estado_conservacao) {
                    res.status(400).send({message: 'Estado de conservação não informado'});
                } else if (!data_aquisicao) {
                    res.status(400).send({message: 'Data de aquisição não informada'});
                } else if (!valor_estimado ) {
                    res.status(400).send({message: 'Valor estimado não informado'});
                } else if (!identificador.type) {
                    res.status(400).send({message: 'Tipo de identificador não informado'});
                } else if (!identificador.value) {
                    if (identificador.type === 'patrimonio') {
                        res.status(400).send({message: 'Patrimônio não informado'});
                    } else if (identificador.type === 'numero_serie') {
                        res.status(400).send({message: 'Número de série não informado'});
                    }
                }
            } else {
                if(identificador.type === 'patrimonio') {
                    const equipmentExist = await this.equipamentosService.getEquipmentByPatrimonio(identificador.value);
                    if(equipmentExist !== undefined) {
                        console.log(`POST /equipamentos [400] BAD REQUEST`);
                        res.status(400).send({message: 'Já existe um equipamento com este patrimônio'});
                        return;
                    } else {
                        let newEquipment = new equipamentoPatrimonioModel(nome, descricao, estado_conservacao, data_aquisicao, valor_estimado, identificador.value);
                        let equipmentCreated = await this.equipamentosService.createEquipmentPatrimonio(newEquipment);
                        console.log(`POST /equipamentos [201] CREATED`);
                        res.status(201).send(equipmentCreated);
                    }
                } else if(identificador.type === 'numero_serie') {
                    const equipmentExist = await this.equipamentosService.getEquipmentBySerie(identificador.value);
                    if(equipmentExist !== undefined) {
                        console.log(`POST /equipamentos [400] BAD REQUEST`);
                        res.status(400).send({message: 'Já existe um equipamento com este numero de série'});
                        return;
                    } else {
                        let newEquipment = new equipamentoSNModel(nome, descricao, estado_conservacao, data_aquisicao, valor_estimado, identificador.value);
                        let equipmentCreated = await this.equipamentosService.createEquipmentSN(newEquipment);
                        console.log(`POST /equipamentos [201] CREATED`);
                        res.status(201).send(equipmentCreated);
                    }
                    }
                }
            } catch (error) {
                console.log(`POST /equipamentos [500] INTERNAL SERVER ERROR \n ${error.message}`);
                res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
            }
    };

    async patchEquipment(req, res) {
        try{
            let updated = await this.equipamentosService.patchEquipment(req.params.id, req.body);
            if(updated === 'Equipamento não encontrado') {
                console.log(`PATCH /equipamentos/:${req.params.id} [404] NOT FOUND`);
                res.status(404).send({message: 'Equipamento não encontrado'});
            } else {
                console.log(`PATCH /equipamentos/:${req.params.id} [200] OK`);
                res.status(200).send(updated);
            }
        } catch (error) {
            console.log(`PATCH /equipamentos/:${req.params.id} [500] INTERNAL SERVER ERROR\n ${error.message}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    };

    async deleteEquipment(req, res) {
        try{
            const deleted = await this.equipamentosService.deleteEquipment(req.params.id);
            if(deleted === 'Equipamento não encontrado') {
                console.log(`DELETE /equipamentos/${req.params.id} [404] NOT FOUND`);
                res.status(404).send({message: 'Equipamento não encontrado'});
            } else {
                console.log(`DELETE /equipamentos/${req.params.id} [200] OK`);
                res.status(200).send(deleted);
            }
        } catch (error) {
            console.log(`DELETE /equipamentos/${req.params.id} [500] INTERNAL SERVER ERROR\n ${error.message}`);
            res.status(500).send({message: '[500] INTERNAL SERVER ERROR'});
        }
    }
}

module.exports = EquipamentosController;