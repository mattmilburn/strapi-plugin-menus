import React from 'react';
import PropTypes from 'prop-types';

import { stopPropagation } from '@strapi/helper-plugin';
import { IconButton } from '@strapi/design-system/IconButton';

import { StyledIconButtonGroup } from './styled';

const Toolbar = ({ actions }) => {
  const visibleActions = actions.filter(({ hidden }) => !hidden);

  return (
    <StyledIconButtonGroup {...stopPropagation}>
      {visibleActions.map(({ icon, key, label, onClick }) => (
        <IconButton key={key} onClick={onClick} label={label} icon={icon} noBorder />
      ))}
    </StyledIconButtonGroup>
  );
};

Toolbar.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      hidden: PropTypes.bool,
      icon: PropTypes.node.isRequired,
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    })
  ).isRequired,
};

export default Toolbar;
