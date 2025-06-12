const serverless = require('serverless-http');
const app = require('../../server/app.cjs');

exports.handler = serverless(app);
