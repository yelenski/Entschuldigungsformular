const serverless = require('serverless-http');
const express = require('express');
const app = require('./helpers/app.cjs');

// Wrapper-App, die alles unter /api mountet
const handlerApp = express();
handlerApp.use('/api', app);

exports.handler = serverless(handlerApp);