'use strict';

const { parseMultipartData } = require( '@strapi/utils' );

const parseBody = ctx => {
  if ( ctx.is( 'multipart' ) ) {
    return parseMultipartData( ctx );
  }

  const { data } = ctx.request.body ?? {};

  return { data };
};


module.exports = parseBody;
