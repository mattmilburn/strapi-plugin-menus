import omit from 'lodash/omit';

const sanitizeEntity = (entity: any): any =>
  omit(entity, [
    'id', // @NOTE - Remove id because this function is only used in create/update methods.
    'created_at',
    'created_by',
    'createdAt',
    'createdBy',
    'updated_at',
    'updated_by',
    'updatedAt',
    'updatedBy',
  ]);

export default sanitizeEntity;
