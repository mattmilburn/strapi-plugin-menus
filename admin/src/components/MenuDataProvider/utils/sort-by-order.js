/**
 * Sort objects in an array based on their `order` prop.
 */

const sortByOrder = (items) => items.sort((a, b) => (a.order > b.order ? 1 : -1));

export default sortByOrder;
