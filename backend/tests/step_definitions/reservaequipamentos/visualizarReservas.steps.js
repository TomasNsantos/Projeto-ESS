const {defineFeature, loadFeature} = require('jest-cucumber');
const app = require('../../../apptest');
const supertest = require('supertest');
const reservaRepository = require('../../../api/repositories/reservaEquipamentos.repository');
const {parse} = require("dotenv-safe");
const feature = loadFeature('./tests/features/reservaequipamentos/visualizarReservas.feature');

defineFeature(feature, test => {

    const server = app.listen(3001);
    let reservaMockRepository, response, request;
    request = supertest(server);

    beforeAll(() => {
        reservaMockRepository = new reservaRepository();
    });

    afterAll(() => {
        server.close();
    });

    const givenExistemReservas = async (given) => {
        given(/^que existem as seguintes reservas de equipamentos:$/, async (json) => {
            const reservas = JSON.parse(json);
            for (let reserva of reservas){
                const exist = await reservaMockRepository.getReservaByID(reserva['id']);
                console.log(exist);
                if (exist === undefined){
                    await reservaMockRepository.createReserva(reserva);
                }
            }
        });
    };
    const whenRequest = async (when) => {
        when(/^eu recebo uma requisicao GET "(.*)" do usuario "(.*)" logado como "(.*)"$/, async  (req, arg1, arg2) => {
            response = await request.get(req.toString());
        });
    }

    const thenReturnEquipments = async (then) => {
        then(/^eu retorno uma lista com as reservas de equipamentos e codigo "(.*)"$/, async (code, docString) => {
            const equipmentExpected = JSON.parse(docString);
            expect(response.statusCode).toBe(parseInt(code));
            expect(response.body).toEqual(equipmentExpected);
        });
    };

    test('Visualizar reservas de equipamentos', ({given, when, then}) => {
        givenExistemReservas(given);
        whenRequest(when);
        thenReturnEquipments(then);
    });
});