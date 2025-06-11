const serverlessExpress = require('netlify-express');
const app = require('../../server/app'); // Passe den Pfad ggf. an

exports.handler = serverlessExpress({ app });
