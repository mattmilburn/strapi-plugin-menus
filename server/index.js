'use strict';

const config = require( './config' );
const contentTypes = require( './content-types' );
const controllers = require( './controllers' );
const routes = require( './routes' );
const services = require( './services' );

module.exports = {
  // bootstrap() {},
  config,
  contentTypes,
  controllers,
  // destroy() {},
  // middlewares: {},
  // policies: {},
  // register() {},
  routes,
  services,
};
