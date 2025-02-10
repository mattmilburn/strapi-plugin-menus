import config, { type ConfigService } from './config';
import documentation, { type DocumentationService } from './documentation';
import menu, { type MenuService } from './menu';
import menuItem, { type MenuItemService } from './menuItem';
import uid, { type UidService } from './uid';

export type MenusServices = {
  config: ConfigService;
  documentation: DocumentationService;
  menu: MenuService;
  'menu-item': MenuItemService;
  uid: UidService;
};

export default {
  config,
  documentation,
  menu,
  'menu-item': menuItem,
  uid,
};
