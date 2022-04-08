import { getTrad } from '../../utils';

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

export default {
  menu,
};
