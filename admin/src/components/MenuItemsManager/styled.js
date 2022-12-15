import styled from 'styled-components';
import { Button } from '@strapi/design-system/Button';
import { Typography } from '@strapi/design-system/Typography';

export const AddButton = styled(Button)`
  height: auto;
  margin-left: 6px;
  margin-bottom: -2px;
  border-color: transparent !important;
  background: transparent !important;
  padding: 0;
  box-shadow: none;

  ${Typography} {
    font-size: ${({ theme }) => theme.fontSizes[1]};
    line-height: ${({ theme }) => theme.lineHeights[3]};
  }

  svg {
    width: ${({ theme }) => theme.spaces[6]};
    height: ${({ theme }) => theme.spaces[6]};
  }

  &,
  &:hover,
  &:active {
    ${Typography} {
      color: ${({ theme }) => theme.colors.primary600};
    }

    svg {
      > circle {
        fill: ${({ theme }) => theme.colors.primary600};
      }

      > path {
        fill: ${({ theme }) => theme.colors.neutral100};
      }
    }
  }
`;
