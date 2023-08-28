import React from 'react';

import { Flex, Typography, ComboboxOption } from '@strapi/design-system';
import { pxToRem } from '@strapi/helper-plugin';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

// import { getTrad } from '../../../utils'; // CUSTOM MOD [4]

const StyledBullet = styled.div`
  flex-shrink: 0;
  width: ${pxToRem(6)};
  height: ${pxToRem(6)};
  margin-right: ${({ theme }) => theme.spaces[2]};
  background-color: ${({ theme, isDraft }) =>
    theme.colors[isDraft ? 'secondary600' : 'success600']};
  border-radius: 50%;
`;

export const Option = ({ publicationState, mainField, id }) => {
  const { formatMessage } = useIntl();
  const stringifiedDisplayValue = (mainField ?? id).toString();

  if (publicationState) {
    const isDraft = publicationState === 'draft';
    const draftMessage = {
      id: 'content-manager.components.Select.draft-info-title', // CUSTOM MOD [4]
      defaultMessage: 'State: Draft',
    };
    const publishedMessage = {
      id: 'content-manager.components.Select.publish-info-title', // CUSTOM MOD [4]
      defaultMessage: 'State: Published',
    };
    const title = isDraft ? formatMessage(draftMessage) : formatMessage(publishedMessage);

    return (
      <ComboboxOption value={id} textValue={stringifiedDisplayValue}>
        <Flex>
          <StyledBullet title={title} isDraft={isDraft} />
          <Typography ellipsis>{stringifiedDisplayValue}</Typography>
        </Flex>
      </ComboboxOption>
    );
  }

  return (
    <ComboboxOption value={id} textValue={stringifiedDisplayValue}>
      {stringifiedDisplayValue}
    </ComboboxOption>
  );
};

Option.defaultProps = {
  mainField: undefined,
  publicationState: undefined,
};

Option.propTypes = {
  id: PropTypes.number.isRequired,
  mainField: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  publicationState: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
};
