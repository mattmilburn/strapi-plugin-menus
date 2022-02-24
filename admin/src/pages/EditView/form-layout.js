import { getTrad } from '../../utils';

const targetOptions = [ '_blank', '_parent', '_self', '_top' ];

const menu = [
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.title' ),
        defaultMessage: 'Title',
      },
      name: 'title',
      type: 'text',
      required: true,
    },
    grid: {
      size: {
        col: 6,
        s: 12,
      },
    },
  },
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.slug' ),
        defaultMessage: 'Slug',
      },
      name: 'slug',
      type: 'uid',
      contentTypeUID: 'plugin::menus.menu',
      attribute: {
        targetField: 'title',
      },
      required: true,
    },
    grid: {
      size: {
        col: 6,
        s: 12,
      },
    },
  },
];

const menuItem = [
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.title' ),
        defaultMessage: 'Title',
      },
      name: 'items[{index}].title',
      type: 'text',
      placeholder: {
        id: getTrad( 'form.placeholder.untitled' ),
        defaultMessage: 'Untitled',
      },
      required: true,
    },
    grid: {
      size: {
        col: 12,
      },
    },
  },
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.url' ),
        defaultMessage: 'URL',
      },
      name: 'items[{index}].url',
      type: 'text',
    },
    grid: {
      size: {
        col: 12,
      },
    },
  },
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.target' ),
        defaultMessage: 'Target',
      },
      name: 'items[{index}].target',
      type: 'select',
      options: targetOptions.map( option => ( {
        key: option,
        value: option,
        metadatas: {
          intlLabel: {
            id: `form.label.option.${option}`,
            defaultMessage: option,
          },
        },
      } ) ),
    },
    grid: {
      size: {
        col: 6,
      },
    },
  },
];

export default {
  menu,
  menuItem,
};
