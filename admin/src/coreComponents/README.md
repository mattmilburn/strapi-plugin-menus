# Core components

Certain components are cloned directly from Strapi at the locations below:

```
/packages/core/admin/admin/src/content-manager/components/InputUID
/packages/core/admin/admin/src/content-manager/components/SelectMany
/packages/core/admin/admin/src/content-manager/components/SelectOne
/packages/core/admin/admin/src/content-manager/components/SelectWrapper
```

### How to keep it updated

As Strapi updates and these components, they may also need to be updated in this plugin. Thankfully the updates are minor and easy to describe.

In the table below are the current modifications.

| Component | Filename | Num | Description |
|-|-|-|-|
| InputUID | index.js | 1 | The `useFormikContext` hook will be used in place of `useCMEditViewDataManager` to provide `initialData` and `modifiedData`. |
| InputUID<br>SelectWrapper | index.js | 2 | The path to `axiosInstance` is updated to use the instance provided in the plugin. |
| InputUID | index.js | 3 | The `getRequestUrl` util will not be used. Instead, we use explicit paths for `/content-manager/uid/` routes. |
| InputUID | index.js | 4 | The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data. |

Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the table above.
