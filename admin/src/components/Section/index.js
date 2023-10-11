import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@strapi/design-system/Box';
import { Stack } from '@strapi/design-system/Stack';
import { Typography } from '@strapi/design-system/Typography';

import { getBoxProps } from '../../utils';

const Section = ({ boxProps, children, stackSize, title }) => {
  return (
    <Box {...getBoxProps(boxProps)}>
      <Stack spacing={stackSize}>
        {!!title && (
          <Typography variant="delta" as="h2">
            {title}
          </Typography>
        )}
        {children}
      </Stack>
    </Box>
  );
};

Section.defaultProps = {
  boxProps: {},
  stackSize: 4,
  title: null,
};

Section.propTypes = {
  boxProps: PropTypes.object,
  children: PropTypes.node.isRequired,
  stackSize: PropTypes.number,
  title: PropTypes.string,
};

export default Section;
