/* eslint-disable no-nested-ternary */
import React, { memo, useMemo, useState } from 'react';

import { NotAllowedInput } from '@strapi/helper-plugin'; // CUSTOM MOD [1].
import get from 'lodash/get';
import has from 'lodash/has'; // CUSTOM MOD [11].
import omit from 'lodash/omit'; // CUSTOM MOD [10].
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { UID_MENU, UID_MENU_ITEM } from '../../constants'; // CUSTOM MOD [7].
import { useMenuData } from '../../hooks'; // CUSTOM MOD [1].
import { useRelation } from './hooks/useRelation'; // CUSTOM MOD [3].
// import { getTrad } from '../../utils'; // CUSTOM MOD [4].
// import { getInitialDataPathUsingTempKeys } from './utils/paths'; // CUSTOM MOD [3].
import { RelationInput } from '../RelationInput';

import { PUBLICATION_STATES, RELATIONS_TO_DISPLAY, SEARCH_RESULTS_TO_DISPLAY } from './constants';
import { connect, diffRelations, normalizeRelation, normalizeSearchResults, select } from './utils';

import {
  getFieldName, // CUSTOM MOD [7].
  getRelationValue, // CUSTOM MOD [7].
} from '../../utils';

export const RelationInputDataManager = ({
  error,
  // entityId, // CUSTOM MOD [9].
  // componentId, // CUSTOM MOD [9].
  // isComponentRelation, // CUSTOM MOD [9].
  editable,
  description,
  intlLabel,
  // isCreatingEntry, // CUSTOM MOD [9].
  // isCloningEntry, // CUSTOM MOD [9].
  isFieldAllowed,
  isFieldReadable,
  labelAction,
  mainField,
  name,
  queryInfos: { endpoints, defaultParams, shouldDisplayRelationLink },
  placeholder,
  required,
  relationType,
  size,
  targetModel,
}) => {
  const [liveText, setLiveText] = useState('');
  const { formatMessage } = useIntl();
  const {
    // slug, // CUSTOM MOD [6].
    initialData,
    isCreatingEntry: isCreatingMenu, // CUSTOM MOD [9].
    modifiedData,
    relationConnect,
    relationDisconnect,
    relationLoad,
    relationReorder,
  } = useMenuData(); // CUSTOM MOD [1].

  const nameSplit = name.split('.');

  // const initialDataPath = getInitialDataPathUsingTempKeys(initialData, modifiedData)(name); // CUSTOM MOD [11].

  const relationsFromInitialData = getRelationValue(initialData, name); // CUSTOM MOD [7].
  const relationsFromModifiedData = getRelationValue(modifiedData, name); // CUSTOM MOD [7].

  const currentLastPage = Math.ceil(relationsFromInitialData.length / RELATIONS_TO_DISPLAY);

  const fieldName = getFieldName(name); // CUSTOM MOD [7].
  const isItemType = name.indexOf('items') === 0; // CUSTOM MOD [7].
  const itemId = isItemType ? get(modifiedData, `${nameSplit.at(0)}.id`) : null; // CUSTOM MOD [7].
  const relationId = itemId ?? initialData?.id ?? ''; // CUSTOM MOD [7].
  const slug = itemId ? UID_MENU_ITEM : UID_MENU; // CUSTOM MOD [6].
  const isCreatingEntry = isCreatingMenu || typeof itemId === 'string'; // CUSTOM MOD [9].
  const cacheKey = `${slug}-${fieldName}-${relationId}`; // CUSTOM MOD [7].

  const { relations, search, searchFor } = useRelation(cacheKey, {
    hasLoaded: has(initialData, name), // CUSTOM MOD [11].
    relation: {
      enabled: !!endpoints.relation,
      endpoint: endpoints.relation,
      pageGoal: currentLastPage,
      pageParams: {
        ...defaultParams,
        pageSize: RELATIONS_TO_DISPLAY,
      },
      onLoad(value) {
        relationLoad({
          target: {
            // initialDataPath: ['initialData', ...initialDataPath], // CUSTOM MOD [11].
            modifiedDataPath: ['modifiedData', ...nameSplit],
            value,
          },
        });
      },
      normalizeArguments: {
        mainFieldName: mainField.name,
        shouldAddLink: shouldDisplayRelationLink,
        targetModel,
      },
    },
    search: {
      endpoint: endpoints.search,
      pageParams: {
        ...defaultParams,
        // eslint-disable-next-line no-nested-ternary
        entityId: isCreatingEntry ? undefined : relationId, // CUSTOM MOD [7].
        pageSize: SEARCH_RESULTS_TO_DISPLAY,
      },
    },
  });

  const isMorph = useMemo(() => relationType.toLowerCase().includes('morph'), [relationType]);
  const toOneRelation = [
    'oneWay',
    'oneToOne',
    'manyToOne',
    'oneToManyMorph',
    'oneToOneMorph',
  ].includes(relationType);

  const isDisabled = useMemo(() => {
    if (isMorph) {
      return true;
    }

    if (!isCreatingEntry) {
      return (!isFieldAllowed && isFieldReadable) || !editable;
    }

    return !editable;
  }, [isMorph, isCreatingEntry, editable, isFieldAllowed, isFieldReadable]);

  const handleRelationConnect = (relation) => {
    /**
     * Any relation being added to the store should be normalized so it has it's link.
     */
    const normalizedRelation = normalizeRelation(
      omit(relation, ['label', 'value']), // CUSTOM MOD [10].
      {
        mainFieldName: mainField.name,
        shouldAddLink: shouldDisplayRelationLink,
        targetModel,
      }
    );

    relationConnect({ name, value: normalizedRelation, toOneRelation });
  };

  const handleRelationDisconnect = (relation) => {
    relationDisconnect({ name, id: relation.id });
  };

  const handleRelationLoadMore = () => {
    relations.fetchNextPage();
  };

  const handleSearch = (term = '') => {
    const [connected, disconnected] = diffRelations(
      relationsFromModifiedData,
      getRelationValue(initialData, name) // CUSTOM MOD [7].
    );

    searchFor(term, {
      idsToInclude: disconnected,
      idsToOmit: connected,
    });
  };

  const handleSearchMore = () => {
    search.fetchNextPage();
  };
  /**
   *
   * @param {number} index
   * @returns {string}
   */
  const getItemPos = (index) => `${index + 1} of ${relationsFromModifiedData.length}`;

  /**
   *
   * @param {number} currentIndex
   * @param {number} oldIndex
   */
  const handleRelationReorder = (oldIndex, newIndex) => {
    const item = relationsFromModifiedData[oldIndex];

    setLiveText(
      formatMessage(
        {
          id: 'content-manager.dnd.reorder', // CUSTOM MOD [4].
          defaultMessage: '{item}, moved. New position in list: {position}.',
        },
        {
          item: item.mainField ?? item.id,
          position: getItemPos(newIndex),
        }
      )
    );

    relationReorder({
      name,
      newIndex,
      oldIndex,
    });
  };

  /**
   *
   * @param {number} index
   * @returns {void}
   */
  const handleGrabItem = (index) => {
    const item = relationsFromModifiedData[index];

    setLiveText(
      formatMessage(
        {
          id: 'content-manager.dnd.grab-item', // CUSTOM MOD [4].
          defaultMessage: `{item}, grabbed. Current position in list: {position}. Press up and down arrow to change position, Spacebar to drop, Escape to cancel.`,
        },
        {
          item: item.mainField ?? item.id,
          position: getItemPos(index),
        }
      )
    );
  };

  /**
   *
   * @param {number} index
   * @returns {void}
   */
  const handleDropItem = (index) => {
    const item = relationsFromModifiedData[index];

    setLiveText(
      formatMessage(
        {
          id: 'content-manager.dnd.drop-item', // CUSTOM MOD [4].
          defaultMessage: `{item}, dropped. Final position in list: {position}.`,
        },
        {
          item: item.mainField ?? item.id,
          position: getItemPos(index),
        }
      )
    );
  };

  /**
   *
   * @param {number} index
   * @returns {void}
   */
  const handleCancel = (index) => {
    const item = relationsFromModifiedData[index];

    setLiveText(
      formatMessage(
        {
          id: 'content-manager.dnd.cancel-item', // CUSTOM MOD [4].
          defaultMessage: '{item}, dropped. Re-order cancelled.',
        },
        {
          item: item.mainField ?? item.id,
        }
      )
    );
  };

  if (
    (!isFieldAllowed && isCreatingEntry) ||
    (!isCreatingEntry && !isFieldAllowed && !isFieldReadable)
  ) {
    return <NotAllowedInput name={name} intlLabel={intlLabel} labelAction={labelAction} />;
  }

  /**
   * How to calculate the total number of relations even if you don't
   * have them all loaded in the browser.
   *
   * 1. The `infiniteQuery` gives you the total number of relations in the pagination result.
   * 2. You can diff the length of the browserState vs the fetchedServerState to determine if you've
   * either added or removed relations.
   * 3. Add them together, if you've removed relations you'll get a negative number and it'll
   * actually subtract from the total number on the server (regardless of how many you fetched).
   */
  const browserRelationsCount = relationsFromModifiedData.length;
  const serverRelationsCount = relationsFromInitialData.length; // CUSTOM MOD [7].
  const realServerRelationsCount = relations.data?.pages[0]?.pagination?.total ?? 0;
  /**
   * _IF_ theres no relations data and the browserCount is the same as serverCount you can therefore assume
   * that the browser count is correct because we've just _made_ this entry and the in-component hook is now fetching.
   */
  const totalRelations =
    !relations.data && browserRelationsCount === serverRelationsCount
      ? browserRelationsCount
      : browserRelationsCount - serverRelationsCount + realServerRelationsCount;

  return (
    <RelationInput
      error={error}
      canReorder={!toOneRelation}
      description={description}
      disabled={isDisabled}
      iconButtonAriaLabel={formatMessage({
        id: 'content-manager.components.RelationInput.icon-button-aria-label', // CUSTOM MOD [4].
        defaultMessage: 'Drag',
      })}
      id={name}
      label={`${formatMessage({
        id: intlLabel.id,
        defaultMessage: intlLabel.defaultMessage,
      })} ${totalRelations > 0 ? `(${totalRelations})` : ''}`}
      labelAction={labelAction}
      labelLoadMore={
        !isCreatingEntry // CUSTOM MOD [7].
          ? formatMessage({
              id: 'content-manager.relation.loadMore', // CUSTOM MOD [4].
              defaultMessage: 'Load More',
            })
          : null
      }
      labelDisconnectRelation={formatMessage({
        id: 'content-manager.relation.disconnect', // CUSTOM MOD [4].
        defaultMessage: 'Remove',
      })}
      listAriaDescription={formatMessage({
        id: 'content-manager.dnd.instructions', // CUSTOM MOD [4].
        defaultMessage: `Press spacebar to grab and re-order`,
      })}
      listHeight={320}
      liveText={liveText}
      loadingMessage={formatMessage({
        id: 'content-manager.relation.isLoading', // CUSTOM MOD [4].
        defaultMessage: 'Relations are loading',
      })}
      name={name}
      noRelationsMessage={formatMessage({
        id: 'content-manager.relation.notAvailable', // CUSTOM MOD [4].
        defaultMessage: 'No relations available',
      })}
      numberOfRelationsToDisplay={RELATIONS_TO_DISPLAY}
      onDropItem={handleDropItem}
      onGrabItem={handleGrabItem}
      onCancel={handleCancel}
      onRelationConnect={handleRelationConnect}
      onRelationDisconnect={handleRelationDisconnect}
      onRelationLoadMore={handleRelationLoadMore}
      onRelationReorder={handleRelationReorder}
      onSearch={(term) => handleSearch(term)}
      onSearchNextPage={() => handleSearchMore()}
      placeholder={formatMessage(
        placeholder || {
          id: 'content-manager.relation.add', // CUSTOM MOD [4].
          defaultMessage: 'Add relation',
        }
      )}
      publicationStateTranslations={{
        [PUBLICATION_STATES.DRAFT]: formatMessage({
          id: 'content-manager.relation.publicationState.draft', // CUSTOM MOD [4].
          defaultMessage: 'Draft',
        }),

        [PUBLICATION_STATES.PUBLISHED]: formatMessage({
          id: 'content-manager.relation.publicationState.published', // CUSTOM MOD [4].
          defaultMessage: 'Published',
        }),
      }}
      relations={pick(
        { ...relations, data: relationsFromModifiedData },
        'data',
        'hasNextPage',
        'isFetchingNextPage',
        'isLoading',
        'isSuccess'
      )}
      required={required}
      searchResults={normalizeSearchResults(search, {
        mainFieldName: mainField.name,
      })}
      size={size}
    />
  );
};

RelationInputDataManager.defaultProps = {
  // componentId: undefined, // CUSTOM MOD [9].
  // entityId: undefined, // CUSTOM MOD [9].
  editable: true,
  error: undefined,
  description: '',
  labelAction: null,
  // isComponentRelation: false, // CUSTOM MOD [9].
  isFieldAllowed: true,
  placeholder: null,
  required: false,
};

RelationInputDataManager.propTypes = {
  // componentId: PropTypes.number, // CUSTOM MOD [9].
  // entityId: PropTypes.number, // CUSTOM MOD [9].
  editable: PropTypes.bool,
  error: PropTypes.string,
  description: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    values: PropTypes.object,
  }).isRequired,
  labelAction: PropTypes.element,
  // isCloningEntry: PropTypes.bool.isRequired, // CUSTOM MOD [9].
  // isCreatingEntry: PropTypes.bool.isRequired, // CUSTOM MOD [9].
  // isComponentRelation: PropTypes.bool, // CUSTOM MOD [9].
  isFieldAllowed: PropTypes.bool,
  isFieldReadable: PropTypes.bool.isRequired,
  mainField: PropTypes.shape({
    name: PropTypes.string.isRequired,
    schema: PropTypes.shape({
      type: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    values: PropTypes.object,
  }),
  required: PropTypes.bool,
  relationType: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  targetModel: PropTypes.string.isRequired,
  queryInfos: PropTypes.shape({
    defaultParams: PropTypes.shape({
      locale: PropTypes.string,
    }),
    endpoints: PropTypes.shape({
      relation: PropTypes.string,
      search: PropTypes.string.isRequired,
    }).isRequired,
    shouldDisplayRelationLink: PropTypes.bool.isRequired,
  }).isRequired,
};

const Memoized = memo(RelationInputDataManager);

export default connect(Memoized, select);
