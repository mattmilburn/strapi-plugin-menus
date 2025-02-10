import menu from './menu';
import menuItem from './menuItem';

export default {
  type: 'content-api',
  routes: [...menu, ...menuItem],
};
