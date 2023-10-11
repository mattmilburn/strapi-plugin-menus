import styled from 'styled-components';

export const Wrapper = styled.div`
  margin-left: ${({ level }) => level ? '2.5rem' : 0};
  padding-top: 1rem;
  position: relative;
  z-index: 1;

  > div {
    position: relative;
    z-index: 2;
  }

  &::before {
    width: 6px;
    background: ${({ theme, level, activeLevel }) =>
      level === activeLevel ? theme.colors.primary600 : theme.colors.primary200};
    border-radius: ${({ level }) => (level ? 0 : '4px')};
    content: '';
    position: absolute;
    top: 0;
    left: 1rem;
    bottom: 0;
    z-index: 1;
  }
`;
