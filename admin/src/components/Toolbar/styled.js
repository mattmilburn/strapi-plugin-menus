import styled from 'styled-components';
import { IconButtonGroup } from '@strapi/design-system/IconButton';

export const StyledIconButtonGroup = styled( IconButtonGroup )`
  & span:first-child button {
    border-left: 0;
  }
`;
