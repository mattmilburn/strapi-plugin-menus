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

| ID | Description |
|-|-|
| 1 | The `useMenuData` hook will be used in place of `useCMEditViewDataManager`. |
| 2 | The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data. |
| 3 | Extra components, hooks, and utils were cloned and their import paths updated in components. |
| 4 | The `getTrad` util will not be used. Instead, we use explicit paths for `content-manager` translation keys. |
| 5 | Remove RBAC features as this plugin does not support RBAC yet. |
| 6 | The `slug` value from `useCMEditViewDataManager` is updated to use either `plugin::menus.menu` or `plugin::menus.menu-item`. |
| 7 | Because menu items' fields are nested in the root menu `items` prop, we need extra handling for accessing values. |
| 8 | Because we are not using a reducer (yet) for state management, we remove the `onLoadRelationsCallback` dependency from `useEffect` otherwise it re-renders infinitely. |
| 9 | Manage the difference between creating a new menu vs. a new menu item. |
| 10 | To maintain proper dirty state for relation fields, we need to omit the `label` and `id` props that come from the `ReactSelect` component. |
| 11 | Avoid re-fetching relation data as fields are toggled in the UI with `hasLoaded` var. Some cloned vars are also removed because of how this is already handled in the plugin. |
| 12 | Dynamic zones and components are not supported in this plugin so logic pertaining to them is removed. |
| 13 | Because the edit menu item UI is designed to be smaller than the content manager UI, the `flexBasis` style will always be 100%. |
| 14 | Replace the `content-manager` path with the equivalent for this plugin. |

Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the table above.
