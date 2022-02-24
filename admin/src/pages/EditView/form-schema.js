import * as yup from 'yup';
import { translatedErrors } from '@strapi/helper-plugin';

import {
  URL_ABSOLUTE_REGEX,
  URL_RELATIVE_REGEX,
  URL_MAILTO_REGEX,
  URL_TEL_REGEX,
} from '../../constants';

const itemSchema = yup.object().shape( {
  order: yup
    .number( translatedErrors.number )
    .required(),
  title: yup
    .string( translatedErrors.string )
    .required(),
  url: yup
    .string( translatedErrors.string )
    .test( value => !! (
      ! value ||
      URL_ABSOLUTE_REGEX.test( value ) ||
      URL_RELATIVE_REGEX.test( value ) ||
      URL_MAILTO_REGEX.test( value ) ||
      URL_TEL_REGEX.test( value )
    ) )
    .nullable(),
  target: yup
    .string( translatedErrors.string )
    .nullable(),
} );

const schema = yup.object().shape( {
  title: yup
    .string( translatedErrors.string )
    .nullable()
    .required(),
  slug: yup
    .string( translatedErrors.string )
    .nullable()
    .required(),
  items: yup
    .array()
    .of( itemSchema ),
} );

export default schema;
