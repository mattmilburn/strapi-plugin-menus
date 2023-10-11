import styled from 'styled-components';
import { IconButtonGroup } from '@strapi/design-system/IconButton';

export const StyledIconButtonGroup = styled(IconButtonGroup)`
  span {
    &:first-child button {
      border-left: 0;
    }

    &:first-child:last-child button {
      border-radius: ${({ theme }) => theme.borderRadius};
    }
  }

  button {
    svg {
      path {
        fill: ${({ theme }) => theme.colors.neutral600} !important;
      }
    }
  }
`;
