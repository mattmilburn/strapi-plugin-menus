/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import has from 'lodash/has'; // CUSTOM MOD [18].
import omit from 'lodash/omit'; // CUSTOM MOD [17].
import pick from 'lodash/pick';

import { NotAllowedInput } from '@strapi/helper-plugin'; // CUSTOM MOD [1].
import { useMenuData } from '../../hooks'; // CUSTOM MOD [1].

import { RelationInput } from '../RelationInput';

import { useRelation } from './hooks/useRelation'; // CUSTOM MOD [6].

import {
  getFieldName, // CUSTOM MOD [11].
  getRelationValue, // CUSTOM MOD [12].
  getTrad,
} from '../../utils';

import { PUBLICATION_STATES, RELATIONS_TO_DISPLAY, SEARCH_RESULTS_TO_DISPLAY } from './constants';
import { connect, select, normalizeSearchResults, diffRelations, normalizeRelation } from './utils';

export const RelationInputDataManager = ({
  error,
  componentId,
  isComponentRelation,
  editable,
  description,
  intlLabel,
  // isCreatingEntry, // CUSTOM MOD [16].
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
    // slug, // CUSTOM MOD [8].
    initialData,
    isCreatingEntry: isCreatingMenu, // CUSTOM MOD [16].
    modifiedData,
    relationConnect,
    relationDisconnect,
    relationLoad,
    relationReorder,
  } =
    // useCMEditViewDataManager(); // CUSTOM MOD [1].
    useMenuData(); // CUSTOM MOD [1].

  const nameSplit = name.split('.');

  // const initialDataPath = getInitialDataPathUsingTempKeys(initialData, modifiedData)(name);

  const relationsFromInitialData = getRelationValue(initialData, name); // CUSTOM MOD [12].
  const relationsFromModifiedData = getRelationValue(modifiedData, name); // CUSTOM MOD [12].

  const currentLastPage = Math.ceil(relationsFromInitialData.length / RELATIONS_TO_DISPLAY);

  const fieldName = getFieldName(name); // CUSTOM MOD [11].
  const isItemType = name.indexOf('items') === 0; // CUSTOM MOD [14].
  const itemId = isItemType ? get(modifiedData, `${nameSplit.at(0)}.id`) : null; // CUSTOM MOD [14].
  const relationId = itemId ?? initialData?.id ?? ''; // CUSTOM MOD [14].
  const slug = itemId ? 'plugin::menus.menu-item' : 'plugin::menus.menu'; // CUSTOM MOD [8].
  const isCreatingEntry = isCreatingMenu || typeof itemId === 'string'; // CUSTOM MOD [16].

  const cacheKey = `${slug}-${fieldName}-${relationId}`; // CUSTOM MOD [11], CUSTOM MOD [14].
  const { relations, search, searchFor } = useRelation(cacheKey, {
    hasLoaded: has( initialData, name ), // CUSTOM MOD [18].
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
            // initialDataPath: ['initialData', ...initialDataPath], // CUSTOM MOD [?].
            // modifiedDataPath: ['modifiedData', ...nameSplit], // CUSTOM MOD [?].
            name,
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
        entityId: isCreatingEntry ? undefined : relationId, // CUSTOM MOD [14].
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
      omit(relation, ['label', 'value']), // CUSTOM MOD [17].
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
      getRelationValue(initialData, name) // CUSTOM MOD [12].
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
          id: 'content.manager.dnd.reorder', // CUSTOM MOD [9].
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
          id: 'content-manager.dnd.grab-item', // CUSTOM MOD [9].
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
          id: 'content-manager.dnd.drop-item', // CUSTOM MOD [9].
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
          id: 'content-manager.dnd.cancel-item', // CUSTOM MOD [9].
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
  const serverRelationsCount = relationsFromInitialData.length; // CUSTOM MOD [12].
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
        id: 'content-manager.components.RelationInput.icon-button-aria-label', // CUSTOM MOD [9].
        defaultMessage: 'Drag',
      })}
      id={name}
      label={`${formatMessage({
        id: intlLabel.id,
        defaultMessage: intlLabel.defaultMessage,
      })} ${totalRelations > 0 ? `(${totalRelations})` : ''}`}
      labelAction={labelAction}
      labelLoadMore={
        !isCreatingEntry
          ? formatMessage({
              id: getTrad('relation.loadMore'),
              defaultMessage: 'Load More',
            })
          : null
      }
      labelDisconnectRelation={formatMessage({
        id: getTrad('relation.disconnect'),
        defaultMessage: 'Remove',
      })}
      listAriaDescription={formatMessage({
        id: 'content-manager.dnd.instructions', // CUSTOM MOD [9].
        defaultMessage: `Press spacebar to grab and re-order`,
      })}
      listHeight={320}
      liveText={liveText}
      loadingMessage={formatMessage({
        id: getTrad('relation.isLoading'),
        defaultMessage: 'Relations are loading',
      })}
      name={name}
      noRelationsMessage={formatMessage({
        id: getTrad('relation.notAvailable'),
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
          id: getTrad('relation.add'),
          defaultMessage: 'Add relation',
        }
      )}
      publicationStateTranslations={{
        [PUBLICATION_STATES.DRAFT]: formatMessage({
          id: getTrad('relation.publicationState.draft'),
          defaultMessage: 'Draft',
        }),

        [PUBLICATION_STATES.PUBLISHED]: formatMessage({
          id: getTrad('relation.publicationState.published'),
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
  componentId: undefined,
  editable: true,
  error: undefined,
  description: '',
  labelAction: null,
  isComponentRelation: false,
  isFieldAllowed: true,
  placeholder: null,
  required: false,
};

RelationInputDataManager.propTypes = {
  componentId: PropTypes.number,
  editable: PropTypes.bool,
  error: PropTypes.string,
  description: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    values: PropTypes.object,
  }).isRequired,
  labelAction: PropTypes.element,
  // isCreatingEntry: PropTypes.bool.isRequired, // CUSTOM MOD [16].
  isComponentRelation: PropTypes.bool,
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
