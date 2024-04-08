'use strict';

const { parseMultipartData } = require('@strapi/utils');

const parseBody = (ctx) => {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx);
  }

  const { data, files } = ctx.request.body || {};

  return { data, files };
};

module.exports = parseBody;
