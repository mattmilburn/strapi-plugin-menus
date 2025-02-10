import { PLUGIN_ID } from '../constants';
import { type MenusServices } from '../services';

const getService = <TName extends keyof MenusServices>(name: TName): MenusServices[TName] =>
  global.strapi.plugin(PLUGIN_ID).service<MenusServices[TName]>(name);

export default getService;
