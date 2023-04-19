<div align="center">
  <img style="width: 160px; height: auto;" src="public/logo-2x.png" alt="Logo for Strapi menus plugin" />
  <h1>Strapi Menus Migration Guides</h1>
  <p>Follow our migration guides to keep your menus plugin up-to-date.</p>
</div>

## Migrate to Strapi v4.6 and v4.7

In both versions, the Users and Permissions plugin features crash while the menus plugin is installed.

If you are trying to upgrade to either of these versions, please instead upgrade straight to v4.9.

## Migrate from v0.x to v1.0.0

The breaking change in this migration is focused on how data is returned from the API. Previously, the plugin would return data in a custom format, similar to the short example below:

```json
{
  "menu": {
    "id": 3,
    "title": "My Menu",
    "slug": "my-menu",
    "items": [
      {
        "id": 1,
        "order": 0,
        "title": "First Item",
        "url": "https://example.com",
        "children": []
      },
      {
        "id": 2,
        "order": 1,
        "title": "Second Item",
        "url": "https://example.com",
        "children": [
          {
            "id": 4,
            "order": 0,
            "title": "Child Item",
            "url": "https://example.com",
            "children": [
              {
                "id": 5,
                "order": 0,
                "title": "Grandchild Item",
                "url": "https://example.com",
                "children": []
              },
            ]
          },
        ]
      },
      {
        "id": 3,
        "order": 2,
        "title": "Third Item",
        "url": "https://example.com",
        "children": []
      },
    ]
  }
}
```

This is inconsistent with how Strapi handles all other data.

Going forward, menus data will be formatted and handled in the same way as Strapi's content-type manager as you below.

```json
{
  "data": {
    "id": 3,
    "attributes": {
      "title": "My Menu",
      "slug": "my-menu",
      "items": {
        "data": [
          {
            "id": 1,
            "attributes": {
              "order": 0,
              "title": "First Item",
              "url": "https://example.com"
            }
          },
          {
            "id": 2,
            "attributes": {
              "order": 1,
              "title": "Second Item",
              "url": "https://example.com",
              "children": {
                "data": [
                  {
                    "id": 4,
                    "order": 0,
                    "title": "Child Item",
                    "url": "https://example.com",
                    "children": {
                      "data": [
                        {
                          "id": 5,
                          "order": 0,
                          "title": "Grandchild Item",
                          "url": "https://example.com",
                          "children": {
                            "data": []
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "id": 3,
            "attributes": {
              "order": 2,
              "title": "Third Item",
              "url": "https://example.com",
              "children": {
                "data": []
              }
            }
          }
        ]
      }
    }
  },
  "meta": {}
}
```

### Don't like the new data structure?

You may feel there are too many `data` and `attributes` nestings that now complicate the data. Thankfully, this new version makes the menus plugin compatible with the [Strapi Transformer plugin](https://github.com/ComfortablyCoding/strapi-plugin-transformer) so you can have cleaner data returned from the API like before.

**You can set this up quickly** by installing and configuring the Transformer plugin with the code below.

```bash
yarn add strapi-plugin-transformer@latest
```

```js
// path: ./config/plugins.js

'use strict';

module.exports = () => ( {
  transformer: {
    responseTransforms: {
      removeAttributesKey: true,
      removeDataKey: true,
    },
  },
} );
```

### More API endpoints

Previously, the menus plugin only provided `find` and `findOne` endpoints. Going forward, the full set of controller and service methods are available through the REST API including `create`, `update`, and `delete` methods.

### Support for REST API params

Previously, the menus plugin always returned data populated with items and other relations. Going forward, nothing is populated by default, just like other API requests in Strapi.

API requests should utilize params like `populate` to retrieve all of the necessary data, which you will most likely want. See the short example below for reference.

> The [qs library](https://github.com/ljharb/qs) is highly recommended for building the request URL.

```js
import qs from 'qs';

// Setup URL.
const apiUrl = 'http://localhost:1337/api';
const path = 'menus';
const params = {
  nested: true,
  populate: '*', // This populates all items, but no item relations if you have them.
};
const query = qs.stringify( params, { addQueryPrefix: true } );
const endpoint = `${apiUrl}/${path}${query}`;

// Fetch data.
const res = await fetch( endpoint, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
} );
```

In case you need a deeper population, here is an example of what that may look.

```js
const params = {
  nested: true,
  populate: {
    items: {
      populate: {
        image: true,
        example_relation: {
          populate: {
            category: true,
          },
        },
      },
    },
  },
};
```
