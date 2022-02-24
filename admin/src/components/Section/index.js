import React from 'react';
import PropTypes from 'prop-types';
import { Box, Stack, Typography } from '@strapi/design-system';

import { getBoxProps } from '../../utils';

const Section = ( { boxProps, children, stackSize, title } ) => {
  return (
    <Box { ...getBoxProps( boxProps ) }>
      <Stack size={ stackSize }>
        { !! title && (
          <Typography variant="delta" as="h2">
            { title }
          </Typography>
        ) }
        { children }
      </Stack>
    </Box>
  );
};

Section.defaultProps = {
  boxProps: {},
  stackSize: 4,
};

Section.propTypes = {
  boxProps: PropTypes.object,
  children: PropTypes.node,
  stackSize: PropTypes.number,
  title: PropTypes.string,
};

export default Section;
