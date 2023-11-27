import React from 'react';
import PropTypes from 'prop-types';
import FlipMove from 'react-flip-move';
import { Flex } from '@strapi/design-system/Flex';
import { Stack } from '@strapi/design-system/Stack';

import { Wrapper } from './styled';

const TreeMenu = ({ action, activeLevel, children, level }) => {
  return (
    <Wrapper level={level} activeLevel={activeLevel}>
      <Stack spacing={4}>
        <FlipMove typeName={null}>
          {children}
          {action && <Flex>{action}</Flex>}
        </FlipMove>
      </Stack>
    </Wrapper>
  );
};

TreeMenu.defaultProps = {
  action: null,
  activeLevel: null,
  level: 0,
};

TreeMenu.propTypes = {
  action: PropTypes.node,
  activeLevel: PropTypes.number,
  children: PropTypes.node.isRequired,
  level: PropTypes.number,
};

export default TreeMenu;
