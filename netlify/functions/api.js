const serverless = require('serverless-http');
const app = require('./helpers/app.cjs');

exports.handler = serverless(app);
