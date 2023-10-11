'use strict';

const admin = require('./admin-api');
const content = require('./content-api');

module.exports = {
  'admin-api': admin,
  'content-api': content,
};
