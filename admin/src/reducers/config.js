import produce from 'immer';

import { RESOLVE_CONFIG } from '../constants';

const initialState = {
  isLoading: true,
  config: {
    maxDepth: null,
    layouts: {},
  },
  schema: {},
};

const configReducer = produce( ( state = initialState, action ) => {
  switch ( action.type ) {
    case RESOLVE_CONFIG:
      state.isLoading = false;
      state.config = action.data.config;
      state.schema = action.data.schema;
      break;

    default:
      return state;
  }

  return state;
} );

export default configReducer;
