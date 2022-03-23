# InputUID component

This component is migrated directly from Strapi at the location below:

```
/packages/core/admin/admin/src/content-manager/components/InputUID
```

As Strapi updates and this component receives updates, it will also need to be updated in this plugin. Thankfully the updates are minor and easy to describe.

### How to keep it updated

The very first thing to do is find the `InputUID` component in Strapi and make a copy. You should only need to edit the `index.js` file, which will be described below.

1. The `useFormikContext` hook will be used in place of `useCMEditViewDataManager` to provide `initialData` and `modifiedData`.

2. The path to `axiosInstance` is updated to use the instance provided in the plugin, but the code for `axiosInstance` is the same as used in Strapi.

3. The `getRequestUrl` util will not be used. Instead, we use explicit paths for `/content-manager/uid/` routes.

4. The `createdAtName` var will be explicitly defined as `createdAt` instead of deriving from `layout` data.

### Please Note
Look for `CUSTOM MOD [n]` comments to identify exactly what lines were changed. The number in the comment corresponds to the numbered list above.
