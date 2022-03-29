import { omit } from 'lodash';

const sanitizeEntity = entity => omit( entity, [
  'created_at',
  'created_by',
  'createdAt',
  'createdBy',
  'updated_at',
  'updated_by',
  'updatedAt',
  'updatedBy',
  'root_menu',
] );

export default sanitizeEntity;
