const camelToTitle = str => {
  const words = str.replace( /([A-Z])/g, ' $1' );

  return words.charAt( 0 ).toUpperCase() + words.slice( 1 );
};

export default camelToTitle;
