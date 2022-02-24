import styled from 'styled-components';
import { TabGroup } from '@strapi/design-system/Tabs';

export const StyledTabGroup = styled(TabGroup)`
  border-radius: 4px;
  box-shadow: ${({ theme }) => theme.shadows.filterShadow};
`;
