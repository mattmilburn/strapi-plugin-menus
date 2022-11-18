# Core components

Certain components are cloned directly from Strapi, with their locations listed below:

```
/packages/core/admin/admin/src/content-manager/components/InputUID
/packages/core/admin/admin/src/content-manager/components/RelationInput
/packages/core/admin/admin/src/content-manager/components/RelationInputDataManager
```

### How to keep core components updated

As Strapi updates, these components may also need to be updated in this plugin. Thankfully the updates are minor and easy to describe. See the table below for the current modifications.

| Num | Component | Filename | Description |
|-|-|-|-|
| 1 | InputUID<br>RelationInputDataManager<br>RelationInputDataManager | index.js<br>utils/select.js<br>RelationInputDataManager.js | The `useMenuData` hook will be used in place of `useCMEditViewDataManager`. |
| 2 | InputUID<br>RelationInputDataManager | index.js<br>useRelation.js | The path to `axiosInstance` is updated to use the instance provided in the plugin. |
| 3 | InputUID<br>RelationInputDataManager<br>RelationInputDataManager | index.js<br>getRelationLink.js<br>utils/select.js | The `getRequestUrl` util will not be used. Instead, we use explicit paths for `/content-manager/` routes. |
| 4 | InputUID | index.js | The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data. |
| 5 | RelationInput | RelationInput.js | The `usePrev`  hook was cloned into this component directory and the import path updated. |
| 6 | RelationInputDataManager | RelationInputDataManager.js | The `useRelation`  hook was cloned into this component directory and the import path updated. |
| 7 | RelationInputDataManager | utils/select.js | This plugin does not handle RBAC yet. Previous props from `useCMEditViewDataManager` are hard-coded in the plugin. |
| 8 | RelationInputDataManager | utils/select.js | The `slug` value from `useCMEditViewDataManager` is hard-coded to `plugin::menus.menu-item`. |

Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the table above.
