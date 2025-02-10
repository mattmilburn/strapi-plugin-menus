import menu from './menu';
import relations from './relations';

export default {
  type: 'admin',
  routes: [...relations, ...menu],
};
