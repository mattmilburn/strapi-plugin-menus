import { factories } from '@strapi/strapi';

import { UID_MENU_ITEM } from '../constants';

const menuItemController = factories.createCoreController(UID_MENU_ITEM);

export default menuItemController;
