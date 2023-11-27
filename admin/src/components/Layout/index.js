import React from 'react';
import PropTypes from 'prop-types';
import { LoadingIndicatorPage, SettingsPageTitle } from '@strapi/helper-plugin';
import { Main } from '@strapi/design-system/Main';

const Layout = ({ children, isLoading, title }) => {
  return isLoading ? (
    <LoadingIndicatorPage />
  ) : (
    <Main aria-busy={isLoading}>
      <SettingsPageTitle name={title} />
      {children}
    </Main>
  );
};

Layout.defaultProps = {
  isLoading: false,
};

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  isLoading: PropTypes.bool,
  title: PropTypes.string.isRequired,
};

export default Layout;
