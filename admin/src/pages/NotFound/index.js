import React from 'react';
import { useIntl } from 'react-intl';
import { ContentLayout, EmptyStateLayout, HeaderLayout, Main } from '@strapi/design-system';
import { LinkButton, useFocusWhenNavigate } from '@strapi/helper-plugin';
import { EmptyPictures, ArrowRight } from '@strapi/icons';

import { pluginId } from '../../utils';

const NotFound = () => {
  useFocusWhenNavigate();
  const { formatMessage } = useIntl();

  return (
    <Main labelledBy="title">
      <HeaderLayout
        id="title"
        title={formatMessage({
          id: 'content-manager.pageNotFound',
          defaultMessage: 'Page not found',
        })}
      />
      <ContentLayout>
        <EmptyStateLayout
          action={
            <LinkButton variant="secondary" endIcon={<ArrowRight />} to={`/plugins/${pluginId}`}>
              {formatMessage({
                id: 'app.components.NotFoundPage.back',
                defaultMessage: 'Back to homepage',
              })}
            </LinkButton>
          }
          content={formatMessage({
            id: 'app.page.not.found',
            defaultMessage: "Oops! We can't seem to find the page you're looging for...",
          })}
          hasRadius
          icon={<EmptyPictures width="10rem" />}
          shadow="tableShadow"
        />
      </ContentLayout>
    </Main>
  );
};

export default NotFound;
