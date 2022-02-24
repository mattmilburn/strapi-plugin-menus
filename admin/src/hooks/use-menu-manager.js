import { useContext } from 'react';

import { MenuManagerContext } from '../contexts';

const useMenuManager = () => useContext( MenuManagerContext );

export default useMenuManager;
