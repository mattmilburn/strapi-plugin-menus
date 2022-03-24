"use strict";

const { find } = require("lodash");
const findChildren = require("./find-children");
const sortByOrder = require("./sort-by-order");

const serializeNestedMenu = (menu, role) => {
  const { items } = menu;

  // Do nothing if there are no items to serialize.
  if (!items || !items.length) {
    return menu;
  }

  const rootItems = items.filter((_item) => !_item.parent);

  // Assign ordered and nested items to root items.
  const nestedItems = rootItems.reduce((acc, item) => {
    const descendants = findChildren(items, item.id, role);
    const rootItem = {
      ...item,
      children: descendants,
    };
    if (descendants.length === 0) {
      if (item.roles.length == 0 || find(item.roles, ["id", role])) {
        return [...acc, rootItem];
      }
    } else {
      return [...acc, rootItem];
    }
    return [...acc];
  }, []);

  return {
    ...menu,
    items: sortByOrder(nestedItems),
  };
};

module.exports = serializeNestedMenu;
