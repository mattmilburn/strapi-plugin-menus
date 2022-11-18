// import { getRequestUrl } from '../../../utils'; // CUSTOM MOD [3].

export function getRelationLink(targetModel, id) {
  return `/content-manager/collectionType/${targetModel}/${id ?? ''}`; // CUSTOM MOD [3].
}
