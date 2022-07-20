import PropTypes from 'prop-types';

const menuItemProps = PropTypes.shape( {
  id: PropTypes.oneOfType( [
    PropTypes.string,
    PropTypes.number,
  ] ).isRequired,
  order: PropTypes.number,
  parent: PropTypes.shape( {
    id: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number,
    ] ).isRequired,
  } ),
  root_menu: PropTypes.shape( {
    id: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number,
    ] ),
  } ),
  title: PropTypes.string.isRequired,
  target: PropTypes.oneOf( [ '_blank', '_parent', '_self', '_top' ] ),
  url: PropTypes.string,
} );

export default menuItemProps;
