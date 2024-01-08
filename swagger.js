const swaggerAutogen = new require('swagger-autogen')();

const outputFile = './dist/swagger/swagger_output.json';
const endpointsFiles = ['./src/routes.js'];

const doc = {
    info: {
        version: "1.0.0",
        title: "Leitor de XML",
        description: "API responsável ler a XML da NF deentrada e retornar as NCMs dos produtos"
    },
    host: "svapps:3337",
    basePath: "/",
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
}

swaggerAutogen(outputFile, endpointsFiles, doc);