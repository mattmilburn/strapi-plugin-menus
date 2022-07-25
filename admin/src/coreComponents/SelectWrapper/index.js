import React, { useCallback, useState, useEffect, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import set from 'lodash/set';
import {
  NotAllowedInput,
  // useCMEditViewDataManager, // CUSTOM MOD [1].
  useQueryParams,
  Link,
} from '@strapi/helper-plugin';
import { useMenuData } from '../../hooks'; // CUSTOM MOD [1].
import { stringify } from 'qs';
import axios from 'axios';
import { Stack } from '@strapi/design-system/Stack';
// import { axiosInstance } from '../../../core/utils'; // CUSTOM MOD [2].
import { axiosInstance, getTrad } from '../../utils'; // CUSTOM MOD [2].
import Label from './Label';
import SelectOne from '../SelectOne';
import SelectMany from '../SelectMany';
import ClearIndicator from './ClearIndicator';
import DropdownIndicator from './DropdownIndicator';
import IndicatorSeparator from './IndicatorSeparator';
import Option from './Option';
// import { connect, select } from './utils'; // CUSTOM MOD [5].
import getSelectStyles from './utils/getSelectStyles';

const initialPaginationState = {
  contains: '',
  limit: 20,
  start: 0,
};

const buildParams = (query, paramsToKeep) => {
  if (!paramsToKeep) {
    return {};
  }

  return paramsToKeep.reduce((acc, current) => {
    const value = get(query, current, null);

    if (value) {
      set(acc, current, value);
    }

    return acc;
  }, {});
};
function SelectWrapper({
  description,
  editable,
  labelAction,
  intlLabel,
  isCreatingEntry,
  isFieldAllowed,
  isFieldReadable,
  mainField,
  name,
  relationType,
  targetModel,
  placeholder,
  queryInfos,
}) {
  const { formatMessage } = useIntl();
  const [{ query }] = useQueryParams();
  // Disable the input in case of a polymorphic relation
  const isMorph = useMemo(() => relationType.toLowerCase().includes('morph'), [relationType]);
  // const {
  //   addRelation,
  //   modifiedData,
  //   moveRelation,
  //   onChange,
  //   onRemoveRelation,
  // } = useCMEditViewDataManager(); // CUSTOM MOD [1].
  const {
    addRelation,
    modifiedData,
    moveRelation,
    handleChange: onChange,
    onRemoveRelation,
  } = useMenuData(); // CUSTOM MOD [1].
  const { pathname } = useLocation();
  const theme = useTheme();

  const value = get(modifiedData, name, null);
  const [state, setState] = useState(initialPaginationState);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    return options.filter(option => {
      if (!isEmpty(value)) {
        // SelectMany
        if (Array.isArray(value)) {
          return findIndex(value, o => o.id === option.value.id) === -1;
        }

        // SelectOne
        return get(value, 'id', '') !== option.value.id;
      }

      return true;
    });
  }, [options, value]);

  const {
    endPoint,
    containsKey,
    defaultParams,
    shouldDisplayRelationLink,
    paramsToKeep,
  } = queryInfos;

  const isSingle = ['oneWay', 'oneToOne', 'manyToOne', 'oneToManyMorph', 'oneToOneMorph'].includes(
    relationType
  );

  const idsToOmit = useMemo(() => {
    if (!value) {
      return [];
    }

    if (isSingle) {
      return [value.id];
    }

    return value.map(val => val.id);
  }, [isSingle, value]);

  const getData = useCallback(
    async source => {
      // Currently polymorphic relations are not handled
      if (isMorph) {
        setIsLoading(false);

        return;
      }

      if (!isFieldAllowed) {
        setIsLoading(false);

        return;
      }

      setIsLoading(true);

      const params = { limit: state.limit, ...defaultParams, start: state.start };

      if (state.contains) {
        params[`filters[${containsKey}][$contains]`] = state.contains;
      }

      try {
        const { data } = await axiosInstance.post(
          endPoint,
          { idsToOmit },
          { params, cancelToken: source.token }
        );

        const formattedData = data.map(obj => {
          return { value: obj, label: obj[mainField.name] };
        });

        setOptions(prevState =>
          prevState.concat(formattedData).filter((obj, index) => {
            const objIndex = prevState.findIndex(el => el.value.id === obj.value.id);

            if (objIndex === -1) {
              return true;
            }

            return prevState.findIndex(el => el.value.id === obj.value.id) === index;
          })
        );
        setIsLoading(false);
      } catch (err) {
        // Silent
        setIsLoading(false);
      }
    },
    [
      containsKey,
      defaultParams,
      endPoint,
      idsToOmit,
      isFieldAllowed,
      isMorph,
      mainField.name,
      state.contains,
      state.limit,
      state.start,
    ]
  );

  useEffect(() => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();

    if (isOpen) {
      getData(source);
    }

    return () => source.cancel('Operation canceled by the user.');
  }, [getData, isOpen]);

  const handleInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      setState(prevState => {
        if (prevState.contains === inputValue) {
          return prevState;
        }

        return { ...prevState, contains: inputValue, start: 0 };
      });
    }

    return inputValue;
  };

  const handleMenuScrollToBottom = () => {
    setState(prevState => ({
      ...prevState,
      start: prevState.start + 20,
    }));
  };

  const handleMenuClose = () => {
    setState(initialPaginationState);
    setIsOpen(false);
  };

  const handleChange = value => {
    onChange({ target: { name, value: value ? value.value : value } });
  };

  const handleAddRelation = value => {
    if (!isEmpty(value)) {
      addRelation({ target: { name, value } });
    }
  };

  const handleMenuOpen = () => {
    setIsOpen(true);
  };

  const to = `/content-manager/collectionType/${targetModel}/${value ? value.id : null}`;

  const searchToPersist = stringify(buildParams(query, paramsToKeep), { encode: false });

  let link = null;

  if (isSingle && value && shouldDisplayRelationLink) {
    link = (
      <Link to={{ pathname: to, state: { from: pathname }, search: searchToPersist }}>
        {formatMessage({ id: getTrad('containers.Edit.seeDetails'), defaultMessage: 'Details' })}
      </Link>
    );
  }

  const Component = isSingle ? SelectOne : SelectMany;
  const associationsLength = isArray(value) ? value.length : 0;

  const isDisabled = useMemo(() => {
    if (isMorph) {
      return true;
    }

    if (!isCreatingEntry) {
      return (!isFieldAllowed && isFieldReadable) || !editable;
    }

    return !editable;
  }, [isMorph, isCreatingEntry, editable, isFieldAllowed, isFieldReadable]);

  if (!isFieldAllowed && isCreatingEntry) {
    return <NotAllowedInput intlLabel={intlLabel} labelAction={labelAction} name={name} />;
  }

  if (!isCreatingEntry && !isFieldAllowed && !isFieldReadable) {
    return <NotAllowedInput intlLabel={intlLabel} labelAction={labelAction} name={name} />;
  }

  const styles = getSelectStyles(theme);

  return (
    <Stack spacing={1}>
      <Label
        intlLabel={intlLabel}
        isSingle={isSingle}
        labelAction={labelAction}
        link={link}
        name={name}
        numberOfEntries={associationsLength}
      />
      <Component
        addRelation={handleAddRelation}
        components={{
          ClearIndicator,
          DropdownIndicator,
          IndicatorSeparator,
          Option,
        }}
        displayNavigationLink={shouldDisplayRelationLink}
        id={name}
        isDisabled={isDisabled}
        isLoading={isLoading}
        isClearable
        mainField={mainField}
        move={moveRelation}
        name={name}
        options={filteredOptions}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onMenuClose={handleMenuClose}
        onMenuOpen={handleMenuOpen}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        onRemove={onRemoveRelation}
        placeholder={placeholder}
        searchToPersist={searchToPersist}
        styles={styles}
        targetModel={targetModel}
        value={value}
        description={description}
      />
    </Stack>
  );
}

SelectWrapper.defaultProps = {
  editable: true,
  description: '',
  labelAction: null,
  isFieldAllowed: true,
  isFieldReadable: true, // CUSTOM MOD [5].
  placeholder: null,
};

SelectWrapper.propTypes = {
  editable: PropTypes.bool,
  description: PropTypes.string,
  intlLabel: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    values: PropTypes.object,
  }).isRequired,
  labelAction: PropTypes.element,
  isCreatingEntry: PropTypes.bool.isRequired,
  isFieldAllowed: PropTypes.bool,
  isFieldReadable: PropTypes.bool, // CUSTOM MOD [5].
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
  relationType: PropTypes.string.isRequired,
  targetModel: PropTypes.string.isRequired,
  queryInfos: PropTypes.shape({
    containsKey: PropTypes.string.isRequired,
    defaultParams: PropTypes.object,
    endPoint: PropTypes.string.isRequired,
    shouldDisplayRelationLink: PropTypes.bool.isRequired,
    paramsToKeep: PropTypes.array,
  }).isRequired,
};

const Memoized = memo(SelectWrapper);

// export default connect(Memoized, select); // CUSTOM MOD [5].
export default Memoized; // CUSTOM MOD [5].
