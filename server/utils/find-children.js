"use strict";

const { get, find } = require("lodash");
const sortByOrder = require("./sort-by-order");

const findChildren = (items, id, role) => {
  const results = [];
  const children = items.filter(
    (_item) => _item.parent && _item.parent.id === id
  );

  children.forEach((child) => {
    const descendants = findChildren(items, child.id, role);

    if (descendants.length === 0) {
      if (child.roles.length == 0 || find(child.roles, ["id", role])) {
        results.push({
          ...child,
          children: descendants,
        });
      }
    } else {
      results.push({
        ...child,
        children: descendants,
      });
    }
  });

  return sortByOrder(results);
};

module.exports = findChildren;
