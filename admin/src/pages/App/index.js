import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@strapi/helper-plugin';

import { pluginId } from '../../utils';
import { EditView, IndexView } from '../';

const App = () => {
  return (
    <div>
      <Switch>
        <Route path={ `/plugins/${pluginId}` } component={ IndexView } exact />
        <Route path={ `/plugins/${pluginId}/clone/:id` } component={ EditView } exact />
        <Route path={ `/plugins/${pluginId}/edit/:id` } component={ EditView } exact />
        <Route component={ NotFound } />
      </Switch>
    </div>
  );
};

export default App;
