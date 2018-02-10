// index file to store all other routes

const BitaksiGetirAppRoutes = require('./bitaksi_getir_app_routes');

module.exports = function(app, db) {
  BitaksiGetirAppRoutes(app, db);
};
