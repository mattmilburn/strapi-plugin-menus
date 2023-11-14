import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from 'react-query';
import { Layout } from '@strapi/design-system';
import { CheckPagePermissions } from '@strapi/helper-plugin';
import pluginPermissions from '../../permissions';

import { pluginId } from '../../utils';
import EditView from '../EditView';
import IndexView from '../IndexView';
import NotFound from '../NotFound';

const queryClient = new QueryClient( {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
} );

const App = () => {
  return (
    <CheckPagePermissions permissions={pluginPermissions.main}>
      <QueryClientProvider client={ queryClient }>
        <Layout>
          <Switch>
            <Route path={ `/plugins/${pluginId}` } component={ IndexView } exact />
            <Route path={ `/plugins/${pluginId}/create` } component={ EditView } exact />
            <Route path={ `/plugins/${pluginId}/clone/:id` } component={ EditView } exact />
            <Route path={ `/plugins/${pluginId}/edit/:id` } component={ EditView } exact />
            <Route path="" component={ NotFound } />
          </Switch>
        </Layout>
      </QueryClientProvider>
    </CheckPagePermissions>
  );
};

export default App;
