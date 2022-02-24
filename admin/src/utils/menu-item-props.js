import PropTypes from 'prop-types';

const menuItemProps = PropTypes.shape( {
  id: PropTypes.oneOfType( [
    PropTypes.string,
    PropTypes.number,
  ] ),
  title: PropTypes.string,
  url: PropTypes.string,
  target: PropTypes.oneOf( [ '_blank', '_parent', '_self', '_top' ] ),
  root_menu: PropTypes.shape( {
    id: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number,
    ] ),
  } ),
  parent: PropTypes.shape( {
    id: PropTypes.oneOfType( [
      PropTypes.string,
      PropTypes.number,
    ] ),
  } ),
} );

export default menuItemProps;
