import React from 'react';
import PropTypes from 'prop-types';
import { Box, Flex } from '@strapi/design-system';
import { PaginationURLQuery, PageSizeURLQuery } from '@strapi/helper-plugin';

const PaginationFooter = ( { pagination } ) => {
  const pageCount = pagination?.total ? Math.ceil( pagination.total / pagination.limit ) : 1;

  return (
    <Box paddingTop={ 4 }>
      <Flex alignItems="flex-end" justifyContent="space-between">
        <PageSizeURLQuery />
        <PaginationURLQuery pagination={ { pageCount } } />
      </Flex>
    </Box>
  );
};

PaginationFooter.defaultProps = {
  pagination: {
    limit: 10,
    start: 0,
    total: 0,
  },
};

PaginationFooter.propTypes = {
  pagination: PropTypes.shape( {
    limit: PropTypes.number,
    start: PropTypes.number,
    total: PropTypes.number.isRequired,
  } ),
};

export default PaginationFooter;
