import get from 'lodash/get';

const getFieldError = (errors, namePath, name) => {
  const msg = get(errors, namePath, null);

  // Ensure that repeatable items remove the array bracket notation from the error.
  if (typeof msg === 'string') {
    return msg.replace(namePath, name);
  }

  return msg;
};

export default getFieldError;
