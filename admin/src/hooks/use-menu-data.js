import { useContext } from 'react';

import { MenuDataContext } from '../contexts';

const useMenuData = () => useContext(MenuDataContext);

export default useMenuData;
