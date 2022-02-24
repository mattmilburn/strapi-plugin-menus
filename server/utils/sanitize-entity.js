const { isNil, omit, omitBy } = require( 'lodash' );

const sanitizeEntity = entity => {
  return omit(
    omitBy( entity, isNil ),
    [
      'id',
      'created_at',
      'created_by',
      'createdAt',
      'createdBy',
      'updated_at',
      'updated_by',
      'updatedAt',
      'updatedBy',
    ]
  );
};

module.exports = sanitizeEntity;
