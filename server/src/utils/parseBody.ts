import { parseMultipartData } from '@strapi/utils';

const parseBody = (ctx: any): any => {
  if (ctx.is('multipart')) {
    return parseMultipartData(ctx);
  }

  const { data, files } = ctx.request.body || {};

  return { data, files };
};

export default parseBody;
