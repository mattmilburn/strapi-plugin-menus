import { useMemo } from 'react';

// import { useCMEditViewDataManager } from '@strapi/helper-plugin'; // CUSTOM MOD [1].
import get from 'lodash/get';
import { useRouteMatch } from 'react-router-dom';

import { pluginId } from '../../../utils'; // CUSTOM MOD [14].
import { useMenuData } from '../../../hooks'; // CUSTOM MOD [1].

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
    modifiedData, // CUSTOM MOD [7].
  } = useMenuData(); // CUSTOM MOD [1].
  const createActionAllowedFields = true; // CUSTOM MOD [5].
  const readActionAllowedFields = true; // CUSTOM MOD [5].
  const updateActionAllowedFields = true; // CUSTOM MOD [5].

  /**
   * This is our cloning route because the EditView & CloneView share the same UI component
   * We need the origin ID to pre-load the relations into the modifiedData of the new
   * to-be-cloned entity.
   */
  const { params } = useRouteMatch(`/plugins/${pluginId}/clone/:id`) ?? {}; // CUSTOM MOD [14].

  const { origin } = params ?? {};

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
  let componentId;

  if (componentUid) {
    componentId = get(modifiedData, fieldNameKeys.slice(0, -1))?.id;
  }

  const isItemType = name.indexOf( 'items' ) === 0; // CUSTOM MOD [7].
  let itemId; // CUSTOM MOD [7].

  if (isItemType) { // CUSTOM MOD [7].
    itemId = get( modifiedData, `${fieldNameKeys.at( 0 )}.id` );
  }

  const entityId = origin || modifiedData.id;
  const slug = itemId ? 'plugin::menus.menu-item' : 'plugin::menus.menu'; // CUSTOM MOD [6], [7].

  // /content-manager/relations/[model]/[id]/[field-name]
  const relationFetchEndpoint = useMemo(() => {
    if (isCreatingEntry && !origin) {
      return null;
    }

    if (componentUid) {
      // repeatable components and dz are dynamically created
      // if no componentId exists in modifiedData it means that the user just created it
      // there then are no relations to request
      return componentId
        ? `/menus/relations/${componentUid}/${componentId}/${fieldNameKeys.at(-1)}`
        : null;
    }

    // Make explicit check for `items` prop so we use a menu item ID, not the menu ID. CUSTOM MOD [7].
    if (isItemType) {
      // We check against newly created items here by inspecting the data type because
      // new menu items are temporarily given a "create_[n]" formatted id attribute.
      return itemId && typeof itemId !== 'string'
        ? `/menus/relations/${slug}/${itemId}/${name.split('.').at(-1)}`
        : null;
    }

    return `/menus/relations/${slug}/${entityId}/${name.split('.').at(-1)}`;
  }, [isCreatingEntry, origin, componentUid, slug, entityId, name, componentId, fieldNameKeys]);

  // /content-manager/relations/[model]/[field-name]
  const relationSearchEndpoint = useMemo(() => {
    if (componentUid) {
      return `/menus/relations/${componentUid}/${name.split('.').at(-1)}`;
    }

    return `/menus/relations/${slug}/${name.split('.').at(-1)}`;
  }, [componentUid, slug, name]);

  return {
    entityId,
    componentId,
    isComponentRelation: Boolean(componentUid),
    queryInfos: {
      ...queryInfos,
      endpoints: {
        search: relationSearchEndpoint,
        relation: relationFetchEndpoint,
      },
    },
    isCloningEntry: Boolean(origin),
    isCreatingEntry,
    isFieldAllowed,
    isFieldReadable,
  };
}

export default useSelect;
