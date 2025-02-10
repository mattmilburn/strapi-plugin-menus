import { type Core } from '@strapi/strapi';

import { UID_MENU } from '../constants';

export type UidService = ReturnType<typeof uidService>;

const uidService = ({ strapi }: { strapi: Core.Strapi }) => ({
  async checkAvailability(slug, id) {
    const params: any = {
      filters: { slug },
    };

    // Optionally exclude by the ID so we don't check the menu against itself.
    if (id) {
      params.filters.id = { $ne: id };
    }

    const entity = await strapi.entityService.findMany(UID_MENU, params);

    return !entity.length;
  },
});

export default uidService;
