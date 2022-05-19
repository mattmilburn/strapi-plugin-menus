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

export const Wrapper = styled( Box )`
  outline: none;
  cursor: pointer;
  position: relative;
  z-index: 2;

  ${({ theme, hasErrors, isActive }) => {
    if ( isActive ) {
      return `
        box-shadow: ${theme.colors[ hasErrors ? 'danger600' : 'primary600' ]} 0 0 0 2px;
      `;
    }
  }}

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
