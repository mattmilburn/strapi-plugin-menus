import { useMemo } from 'react';
import get from 'lodash/get';
// import { useCMEditViewDataManager } from '@strapi/helper-plugin'; // CUSTOM MOD [1].
import { useMenuData } from '../../../hooks'; // CUSTOM MOD [1].

import { getRequestUrl } from '../../../utils';

function useSelect({
  componentUid,
  isUserAllowedToEditField,
  isUserAllowedToReadField,
  name,
  queryInfos,
}) {
  // const {
  //   isCreatingEntry,
  //   createActionAllowedFields,
  //   readActionAllowedFields,
  //   updateActionAllowedFields,
  //   slug,
  //   modifiedData,
  // } = useCMEditViewDataManager(); // CUSTOM MOD [1].
  const {
    isCreatingEntry,
    modifiedData, // CUSTOM MOD [14].
  } = useMenuData(); // CUSTOM MOD [1].
  const createActionAllowedFields = true; // CUSTOM MOD [7].
  const readActionAllowedFields = true; // CUSTOM MOD [7].
  const updateActionAllowedFields = true; // CUSTOM MOD [7].

  const isFieldAllowed = useMemo(() => {
    if (isUserAllowedToEditField === true) {
      return true;
    }

    const allowedFields = isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;

    return allowedFields.includes(name);
  }, [
    isCreatingEntry,
    createActionAllowedFields,
    name,
    isUserAllowedToEditField,
    updateActionAllowedFields,
  ]);

  const isFieldReadable = useMemo(() => {
    if (isUserAllowedToReadField) {
      return true;
    }

    const allowedFields = isCreatingEntry ? [] : readActionAllowedFields;

    return allowedFields.includes(name);
  }, [isCreatingEntry, isUserAllowedToReadField, name, readActionAllowedFields]);

  const fieldNameKeys = name.split('.');
  const isItemType = name.indexOf( 'items' ) === 0; // CUSTOM MOD [14].
  let componentId;
  let itemId; // CUSTOM MOD [14].

  if (componentUid) {
    componentId = get(modifiedData, fieldNameKeys.slice(0, -1))?.id;
  }

  if (isItemType) { // CUSTOM MOD [14].
    itemId = get( modifiedData, `${fieldNameKeys.at( 0 )}.id` );
  }

  const slug = itemId ? 'plugin::menus.menu-item' : 'plugin::menus.menu'; // CUSTOM MOD [8], CUSTOM MOD [14].

  // /content-manager/relations/[model]/[id]/[field-name]
  const relationFetchEndpoint = useMemo(() => {
    if (isCreatingEntry) {
      return null;
    }

    if (componentUid) {
      // repeatable components and dz are dynamically created
      // if no componentId exists in modifiedData it means that the user just created it
      // there then are no relations to request
      return componentId
        ? getRequestUrl(`relations/${componentUid}/${componentId}/${fieldNameKeys.at(-1)}`)
        : null;
    }

    // Make explicit check for `items` prop so we use a menu item ID, not the menu ID. CUSTOM MOD [14].
    if (isItemType) {
      // We check against newly created items here by inspecting the data type because
      // new menu items are temporarily given a "create_[n]" formatted id attribute.
      return itemId && typeof itemId !== 'string'
        ? getRequestUrl(`relations/${slug}/${itemId}/${name.split('.').at(-1)}`)
        : null;
    }

    return getRequestUrl(`relations/${slug}/${modifiedData.id}/${name.split('.').at(-1)}`);
  }, [isCreatingEntry, componentUid, slug, modifiedData.id, name, componentId, fieldNameKeys]);

  // /content-manager/relations/[model]/[field-name]
  const relationSearchEndpoint = useMemo(() => {
    if (componentUid) {
      return getRequestUrl(`relations/${componentUid}/${name.split('.').at(-1)}`);
    }

    return getRequestUrl(`relations/${slug}/${name.split('.').at(-1)}`);
  }, [componentUid, slug, name]);

  return {
    componentId,
    isComponentRelation: Boolean(componentUid),
    queryInfos: {
      ...queryInfos,
      endpoints: {
        search: relationSearchEndpoint,
        relation: relationFetchEndpoint,
      },
    },
    isCreatingEntry,
    isFieldAllowed,
    isFieldReadable,
  };
}

export default useSelect;
