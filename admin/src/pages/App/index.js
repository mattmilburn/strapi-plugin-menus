import React from "react";
import {Switch, Route} from "react-router-dom";
import {QueryClientProvider, QueryClient} from "react-query";
import {NotFound} from "@strapi/helper-plugin";

import pluginId from "../../utils/plugin-id";
import EditView from "../EditView";
import IndexView from "../IndexView";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Switch>
          <Route path={`/plugins/${pluginId}`} component={IndexView} exact />
          <Route
            path={`/plugins/${pluginId}/create`}
            component={EditView}
            exact
          />
          <Route
            path={`/plugins/${pluginId}/clone/:id`}
            component={EditView}
            exact
          />
          <Route
            path={`/plugins/${pluginId}/edit/:id`}
            component={EditView}
            exact
          />
          <Route component={NotFound} />
        </Switch>
      </div>
    </QueryClientProvider>
  );
};

export default App;
