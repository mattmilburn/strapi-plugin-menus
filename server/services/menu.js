'use strict';

const get = require('lodash/get');
const omit = require('lodash/omit');
const pick = require('lodash/pick');
const { createCoreService } = require('@strapi/strapi').factories;

const { UID_MENU } = require('../constants');
const { getService } = require('../utils');

module.exports = createCoreService(UID_MENU, ({ strapi }) => ({
  async create(params) {
    const { data } = params;
    const menuData = pick(data, ['title', 'slug'], {});
    const menuItemsData = get(data, 'items', []);

    // Create new menu.
    const entity = await super.create({ ...params, data: menuData });

    // Create or update menu items.
    if (menuItemsData.length) {
      await getService('menu-item').bulkCreateOrUpdate(menuItemsData, entity.id);
    }

    const findParams = this.getFetchParams(omit(params, ['data', 'files']));

    // Because we create the menu before creating the items, we use `findOne`
    // here to ensure `params` are used consistently throughout the request.
    return strapi.entityService.findOne(UID_MENU, entity.id, findParams);
  },

  async update(id, params) {
    const { data } = params;

    // Get the menu we are about to update so we can compare it to new data.
    const entityToUpdate = await getService('menu').findOne(id, {
      populate: ['items', 'items.parent'],
    });

    const menuData = pick(data, ['title', 'slug'], {});
    const menuItemsData = get(data, 'items', []);
    const prevItemsData = get(entityToUpdate, 'items', []);

    // Compare new menu items to existing items to determine which can be deleted.
    const itemsToDelete = prevItemsData.filter((item) => {
      return !menuItemsData.find((_item) => _item.id === item.id);
    });

    // First, delete menu items that were removed from the menu.
    if (itemsToDelete.length) {
      await getService('menu-item').bulkDelete(itemsToDelete);
    }

    // Next, create or update menu items.
    if (menuItemsData.length) {
      await getService('menu-item').bulkCreateOrUpdate(menuItemsData, id);
    }

    /**
     * @TODO - Should menus and menu items only update if they've actually changed?
     */

    // Finally, update the menu.
    return await super.update(id, {
      ...params,
      data: menuData,
    });
  },

  async delete(id) {
    // First, delete menu items belonging to the menu that will be deleted.
    const itemsToDelete = await getService('menu-item').findByRootMenu(id);

    if (itemsToDelete.length) {
      await getService('menu-item').bulkDelete(itemsToDelete);
    }

    // Finally, delete the menu.
    return await super.delete(id);
  },
}));
