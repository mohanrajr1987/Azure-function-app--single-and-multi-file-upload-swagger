const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

module.exports = async function (context, req) {
    const html = swaggerUi.generateHTML(swaggerSpec);
    
    context.res = {
        status: 200,
        headers: {
            'Content-Type': 'text/html'
        },
        body: html
    };
};
