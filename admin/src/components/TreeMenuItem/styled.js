import styled from 'styled-components';
import { Box } from '@strapi/design-system';

import { StyledIconButtonGroup } from '../Toolbar/styled';

export const Label = styled.div`
  padding-right: 1rem;
  line-height: 2rem;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const Wrapper = styled(Box)`
  /* prettier-ignore */
  box-shadow: ${({ theme, hasErrors, isActive }) =>
    !isActive ? 'none' : theme.colors[hasErrors ? 'danger600' : 'primary600']} 0 0 0 2px;
  color: ${({ theme }) => theme.colors.neutral800};
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 2;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary100};
    color: ${({ theme }) => theme.colors.primary600};

    ${StyledIconButtonGroup} {
      button {
        svg {
          path {
            fill: ${({ theme }) => theme.colors.primary600} !important;
          }
        }

        &:hover {
          svg {
            path {
              fill: ${({ theme }) => theme.colors.neutral600} !important;
            }
          }
        }
      }
    }
  }
`;
