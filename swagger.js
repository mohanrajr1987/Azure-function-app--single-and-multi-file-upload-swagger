const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'File Upload API',
      version: '1.0.0',
      description: 'API for handling single and multiple file uploads',
    },
    servers: [
      {
        url: 'http://localhost:7071',
        description: 'Local development server',
      },
    ],
  },
  apis: ['./SingleFileUpload/index.js', './MultiFileUpload/index.js'],
};

module.exports = swaggerJsdoc(options);
