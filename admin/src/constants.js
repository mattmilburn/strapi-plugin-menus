import pluginId from './utils/plugin-id';

export const HEADER_HEIGHT = 96;

export const ACTION_RESOLVE_CONFIG = `${pluginId}/resolve-config`;

export const URL_ABSOLUTE_REGEX = new RegExp(
  '^(https?:\\/\\/)?'+
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
  '((\\d{1,3}\\.){3}\\d{1,3}))'+
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+@]*)*'+
  '(\\?[-a-z\\d%_.~+@;&=]*)?'+
  '(\\#[-a-z\\d_]*)?$',
  'i'
);

export const URL_RELATIVE_REGEX = new RegExp(
  '^(\\/[-a-z\\d%_.~+@]*)*'+
  '(\\?[-a-z\\d%_.~+@;&=]*)?'+
  '(\\#[-a-z\\d_]*)?$',
  'i'
);

export const URL_MAILTO_REGEX = new RegExp( '^mailto:(.*)@(.*)\\.(.*)$', 'i' );
export const URL_TEL_REGEX = new RegExp( '^tel:(\\+|\\d)[\\d\\-]+$', 'i' );
