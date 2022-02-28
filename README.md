<div align="center">
  <img style="width: 160px; height: auto;" src="public/logo.png" alt="Logo for Strapi menus plugin" />
</div>

<div align="center">
  <h1>Strapi Menus</h1>
  <p>A plugin for Strapi CMS to customize the structure of menus and menu items.</p>
</div>

## Get Started

* [Installation](#installation)
* [Configuration](#configuration)
* [API Usage](#api-usage)
* [Roadmap](#roadmap)

## Installation
```bash
yarn add strapi-plugin-menus@latest
```

## Configuration
| property | type (default) | description |
| - | - | - |
| maxDepth | number (`null`) | Limits how deep menu items can be nested. |

*Additional options are currently in development.*

### `maxDepth`
Limits how deep menus can be nested. By default, there is no limit.

#### Example

`./config/plugins.js`

```js
module.exports = {
  'menus': {
    enabled: true,
    config: {
      maxDepth: 3,
    },
  },
};
```

## API Usage
Find all menus at `/api/menus`.

Individual menus can be found at `/api/menus/:slug` by adding the `slug` param, which is more intuitive than finding by `id` in this case.

#### Example

Fetch a menu with the slug "main".

```js
await fetch( '/api/menus/main' );
```

#### Response

```json
{
  "menu": {
    "id": 1,
    "title": "Main Menu",
    "slug": "main",
    "createdAt": "2022-02-24T23:31:16.668Z",
    "updatedAt": "2022-02-24T23:31:16.678Z",
    "items": [
      {
        "id": 1,
        "title": "Home",
        "url": "/",
        "order": 1,
        "target": null,
        "parent": null,
        "createdAt": "2022-02-24T23:31:16.668Z",
        "updatedAt": "2022-02-24T23:31:16.668Z",
        "createdBy": null,
        "updatedBy": null
      },
      {
        "id": 2,
        "title": "About",
        "url": "/about",
        "order": 2,
        "target": null,
        "parent": null,
        "createdAt": "2022-02-24T23:31:16.668Z",
        "updatedAt": "2022-02-24T23:31:16.668Z",
        "createdBy": null,
        "updatedBy": null
      },
      {
        "id": 4,
        "title": "Contact",
        "url": "mailto:email@example.com",
        "order": 4,
        "target": "_blank",
        "parent": null,
        "createdAt": "2022-02-24T23:31:16.668Z",
        "updatedAt": "2022-02-24T23:31:16.668Z",
        "createdBy": null,
        "updatedBy": null
      },
      {
        "id": 5,
        "title": "Github",
        "url": "https://github.com",
        "order": 5,
        "target": "_blank",
        "parent": null,
        "createdAt": "2022-02-24T23:31:16.668Z",
        "updatedAt": "2022-02-24T23:31:16.668Z",
        "createdBy": null,
        "updatedBy": null
      }
    ]
  }
}
```

## Roadmap
TBD
