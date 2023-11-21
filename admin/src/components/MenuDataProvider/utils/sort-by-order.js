/**
 * Sort objects in an array based on their `order` prop.
 */

const sortByOrder = (arr) => arr.sort((a, b) => (a.order > b.order ? 1 : -1));

export default sortByOrder;
