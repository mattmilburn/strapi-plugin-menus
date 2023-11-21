'use strict';

const get = require('lodash/get');
const has = require('lodash/has');

const NON_LISTABLES = ['json', 'password', 'richtext', 'dynamiczone'];
const LISTABLE_RELATIONS = ['oneToOne', 'oneToMany', 'manyToOne', 'manyToMany'];

const isListable = (schema, name) => {
  if (!has(schema.attributes, name)) {
    return false;
  }

  const isHidden = get(schema, ['config', 'attributes', name, 'hidden'], false);

  if (isHidden) {
    return false;
  }

  const attribute = schema.attributes[name];

  if (NON_LISTABLES.includes(attribute.type)) {
    return false;
  }

  const isRelation = attribute.type === 'relation';

  if (isRelation && !LISTABLE_RELATIONS.includes(attribute.relationType)) {
    return false;
  }

  return true;
};

module.exports = isListable;
