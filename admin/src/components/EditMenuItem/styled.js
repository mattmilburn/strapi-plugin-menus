import styled from 'styled-components';
import { TabGroup } from '@strapi/design-system/Tabs';

export const StyledTabGroup = styled(TabGroup)`
  [role='tablist'] {
    border-bottom: 2px solid ${({ theme }) => theme.colors.neutral150};

    button {
      position: relative;
      top: 2px;
    }
  }
`;
