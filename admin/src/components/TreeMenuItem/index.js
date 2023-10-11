import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import { Flex } from '@strapi/design-system/Flex';
import { Typography } from '@strapi/design-system/Typography';
import ChevronDown from '@strapi/icons/ChevronDown';
import ChevronUp from '@strapi/icons/ChevronUp';
import Plus from '@strapi/icons/Plus';
import Trash from '@strapi/icons/Trash';

import Toolbar from '../Toolbar';
import { getBoxProps, getTrad, menuItemProps } from '../../utils';
import { Label, Wrapper } from './styled';

const TreeMenuItem = forwardRef(
  (
    {
      children,
      data,
      hasErrors,
      isFirst,
      isLast,
      isActive,
      isMaxDepth,
      onAddSubmenu,
      onClick,
      onDelete,
      onMoveUp,
      onMoveDown,
    },
    ref
  ) => {
    const { formatMessage } = useIntl();

    let bgColor, borderColor;

    if (hasErrors) {
      bgColor = 'danger100';
      borderColor = 'danger600';
    }

    const boxProps = getBoxProps({
      background: bgColor ?? 'neutral0',
      borderSize: 1,
      borderStyle: 'solid',
      borderColor: borderColor ?? 'transparent',
      paddingTop: 2,
      paddingLeft: 6,
      paddingRight: 2,
      paddingBottom: 2,
      shadow: 'filterShadow',
      transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
    });

    const actions = [
      {
        key: 'add',
        hidden: isMaxDepth,
        icon: <Plus />,
        label: formatMessage({
          id: getTrad('ui.add.menu'),
          defaultMessage: 'Add submenu',
        }),
        onClick: onAddSubmenu,
      },
      {
        key: 'move-down',
        hidden: isLast,
        icon: <ChevronDown />,
        label: formatMessage({
          id: getTrad('ui.move.menuItem.down'),
          defaultMessage: 'Move item down',
        }),
        onClick: onMoveDown,
      },
      {
        key: 'move-up',
        hidden: isFirst,
        icon: <ChevronUp />,
        label: formatMessage({
          id: getTrad('ui.move.menuItem.up'),
          defaultMessage: 'Move item up',
        }),
        onClick: onMoveUp,
      },
      {
        key: 'delete',
        hidden: false,
        icon: <Trash />,
        label: formatMessage({
          id: getTrad('ui.delete.menuItem'),
          defaultMessage: 'Delete menu item',
        }),
        onClick: onDelete,
      },
    ];

    return (
      <div ref={ref}>
        <Wrapper {...boxProps} hasErrors={hasErrors} isActive={isActive} onClick={onClick}>
          <Flex justifyContent="space-between">
            <Label>
              {!!data.title ? (
                data.title
              ) : (
                <Typography textColor="neutral400" style={{ fontStyle: 'italic' }}>
                  {formatMessage({
                    id: getTrad('ui.untitled'),
                    defaultMessage: 'Untitled',
                  })}
                </Typography>
              )}
            </Label>
            {isActive && <Toolbar actions={actions} />}
          </Flex>
        </Wrapper>
        {children}
      </div>
    );
  }
);

TreeMenuItem.defaultProps = {
  children: null,
  hasErrors: false,
  isActive: false,
  isFirst: false,
  isLast: false,
  isMaxDepth: false,
  onAddSubmenu: () => {},
  onClick: () => {},
  onDelete: () => {},
  onMoveUp: () => {},
  onMoveDown: () => {},
};

TreeMenuItem.propTypes = {
  children: PropTypes.node,
  data: menuItemProps.isRequired,
  hasErrors: PropTypes.bool,
  isActive: PropTypes.bool,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  isMaxDepth: PropTypes.bool,
  onAddSubmenu: PropTypes.func,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

export default TreeMenuItem;
