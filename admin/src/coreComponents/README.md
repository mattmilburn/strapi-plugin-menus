# Core components

Certain components are cloned directly from Strapi, with their locations listed below:

```
/packages/core/admin/admin/src/content-manager/components/InputUID
/packages/core/admin/admin/src/content-manager/components/SelectMany
/packages/core/admin/admin/src/content-manager/components/SelectOne
/packages/core/admin/admin/src/content-manager/components/SelectWrapper
```

### How to keep core components updated

As Strapi updates, these components may also need to be updated in this plugin. Thankfully the updates are minor and easy to describe. See the table below for the current modifications.

| Num | Component | Filename | Description |
|-|-|-|-|
| 1 | InputUID<br>SelectWrapper | index.js | The `useMenuData` hook will be used in place of `useCMEditViewDataManager`. |
| 2 | InputUID<br>SelectWrapper | index.js | The path to `axiosInstance` is updated to use the instance provided in the plugin. |
| 3 | InputUID | index.js | The `getRequestUrl` util will not be used. Instead, we use explicit paths for `/content-manager/uid/` routes. |
| 4 | InputUID | index.js | The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data. |
| 5 | SelectWrapper | index.js | The `connect` and `select` functions are omitted because this plugin is not handling RBAC yet. Previous props from these functions are hard-coded in the plugin. |

Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the table above.
