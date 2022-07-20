import PropTypes from 'prop-types';

import menuItemProps from './menu-item-props';

const menuProps = PropTypes.shape( {
  id: PropTypes.number,
  title: PropTypes.string.isRequired,
  slug: PropTypes.string.isRequired,
  items: PropTypes.arrayOf( menuItemProps ),
} );

export default menuItemProps;
