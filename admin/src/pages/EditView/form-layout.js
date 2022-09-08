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
      col: 6,
      s: 12,
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
      col: 6,
      s: 12,
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
      name: 'title',
      type: 'text',
      placeholder: {
        id: getTrad( 'form.placeholder.untitled' ),
        defaultMessage: 'Untitled',
      },
      required: true,
    },
  },
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.url' ),
        defaultMessage: 'URL',
      },
      name: 'url',
      type: 'text',
    },
  },
  {
    input: {
      intlLabel: {
        id: getTrad( 'form.label.target' ),
        defaultMessage: 'Target',
      },
      name: 'target',
      type: 'select',
      options: targetOptions.map( option => ( {
        key: option,
        value: option,
        metadatas: {
          intlLabel: {
            id: getTrad(`form.label.option.${option}`),
            defaultMessage: option,
          },
        },
      } ) ),
    },
    grid: {
      col: 6,
    },
  },
];

export default {
  menu,
  menuItem,
};
