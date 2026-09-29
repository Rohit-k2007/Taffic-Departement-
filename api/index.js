/**
 * Vercel Serverless Function entry point for NATDAMS API
 * Forwards all /api/* requests to the requestHandler in server.js
 */

const requestHandler = require('../server');

module.exports = (req, res) => {
  return requestHandler(req, res);
};
