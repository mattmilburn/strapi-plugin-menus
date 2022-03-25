import React from 'react';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';
import { Flex, Stack } from '@strapi/design-system';

import { Wrapper } from './styled';

const TreeMenu = ( { action, activeLevel, children, level } ) => {
  return (
    <Wrapper level={ level } activeLevel={ activeLevel }>
      <Stack spacing={ 4 }>
        <FlipMove typeName={ null }>
          { children }
          { action && (
            <Flex>
              { action }
            </Flex>
          ) }
        </FlipMove>
      </Stack>
    </Wrapper>
  );
};

TreeMenu.defaultProps = {
  level: 0,
};

TreeMenu.propTypes = {
  action: PropTypes.node,
  activeLevel: PropTypes.number,
  children: PropTypes.node.isRequired,
  level: PropTypes.number,
};

export default TreeMenu;
