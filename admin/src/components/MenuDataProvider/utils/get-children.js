/**
 * Find objects in an array with `parent` props matching `parentId`.
 */

const getChildren = (parentId, items) => items.filter((item) => item?.parent?.id === parentId);

export default getChildren;
