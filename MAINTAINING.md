# Maintenance for core components and files

Certain components or files are cloned directly from Strapi, with some their locations listed below:

```
/packages/core/admin/admin/src/content-manager/components
/packages/core/admin/admin/src/content-manager/hooks
/packages/core/admin/admin/src/content-manager/utils
/packages/core/content-manager/server/controllers
```

### How to keep core components and files updated

As Strapi updates, these components and files may also need to be updated in this plugin. Thankfully the updates are minor and easy to describe. See the table below for the current modifications.

| Num | Location | Filename | Description |
|-|-|-|-|
| 1 | InputUID<br>RelationInputDataManager<br>RelationInputDataManager | index.js<br>utils/select.js<br>RelationInputDataManager.js | The `useMenuData` hook will be used in place of `useCMEditViewDataManager`. |
| 2 | InputUID<br>RelationInputDataManager | index.js<br>useRelation.js | The path to `axiosInstance` is updated to use the instance provided in the plugin. |
| 3 | InputUID<br>RelationInputDataManager | index.js<br>getRelationLink.js | The `getRequestUrl` util will not be used. Instead, we use explicit paths for `/content-manager/` routes. |
| 4 | InputUID | index.js | The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data. |
| 5 | RelationInput<br>RelationInput<br>RelationInputDataManager | RelationInput.js<br>RelationItem.js<br>useRelation.js | Certain hooks and utils were cloned and their import paths updated in components. |
| 6 | DragLayer<br>RelationInput<br>RelationInputDataManager | RelationDragPreview.js<br>Option.js<br>RelationInputDataManager.js | The `getTrad` util will not be used. Instead, we use explicit paths for `content-manager` translations. |
| 7 | RelationInputDataManager | utils/select.js | This plugin does not handle RBAC yet. Previous props from `useCMEditViewDataManager` are hard-coded in the plugin. |
| 8 | RelationInputDataManager | utils/select.js | The `slug` value from `useCMEditViewDataManager` is hard-coded to either `plugin::menus.menu` or `plugin::menus.menu-item`. |
| 9 | Relations Controller | relations.js | The `getService` util will not be used. Instead we explicitly use `content-manager` service or provide a custom `getService` function that points to the `content-manager` plugin. |
| 10 | Relations Controller | relations.js | RBAC is not currently supported with this plugin so permission checks are commented out. |
| 11 | RelationInputDataManager | RelationInputDataManager.js | Because menu items' fields are nested in the root menu `items` prop, we need extra handling for the field name vs field key. |
| 12 | RelationInputDataManager | RelationInputDataManager.js | Because menu items' fields are nested in the root menu `items` prop, we need extra handling for accessing values of relation fields. |
| 13 | RelationInputDataManager | useRelation.js | Because we are not using a reducer, we remove the `onLoadRelationsCallback` dependency from `useEffect`. |
| 14 | RelationInputDataManager<br>RelationInputDataManager | RelationInputDataManager.js<br>utils/select.js | Because menu items' fields are nested in the root menu `items` prop, we need extra handling when using the menu item `id` vs. the root menu `id`. |
| 15 | RelationInput | Relation.js | Remove the `size` condition from the relation select input because the menus UI is narrower than the content manager UI. |
| 16 | RelationInputDataManager | RelationInputDataManager.js | Manage the difference between creating a new menu vs. a new menu item. |
| 17 | RelationInputDataManager | RelationInputDataManager.js | To maintain proper dirty state for relation fields, we need to omit the `label` and `id` props that come from the `ReactSelect` component. |
| 18 | RelationInputDataManager<br>RelationInputDataManager | RelationInputDataManager.js<br>useRelation.js | Avoid re-fetching relation data as fields are toggled in the UI with `hasLoaded` var. Some cloned vars are also removed because of how this is already handled in the plugin. |
| 19 | RelationInput | components/RelationItem.js | This plugin has no need to work with different item types like dynamic zones or components. |

Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the table above.
