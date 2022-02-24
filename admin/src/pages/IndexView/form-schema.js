import * as yup from 'yup';
import { translatedErrors } from '@strapi/helper-plugin';

const schema = yup.object().shape( {
  title: yup
    .string( translatedErrors.string )
    .nullable()
    .required(),
  slug: yup
    .string( translatedErrors.string )
    .nullable()
    .required(),
} );

export default schema;
