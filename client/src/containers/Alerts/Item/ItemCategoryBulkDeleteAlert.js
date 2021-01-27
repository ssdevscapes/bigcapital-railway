import React from 'react';
import {
  FormattedMessage as T,
  FormattedHTMLMessage,
  useIntl,
} from 'react-intl';
import { Intent, Alert } from '@blueprintjs/core';
import { AppToaster } from 'components';

import withItemCategoriesActions from 'containers/Items/withItemCategoriesActions';
import withAlertStoreConnect from 'containers/Alert/withAlertStoreConnect';
import withAlertActions from 'containers/Alert/withAlertActions';

import { compose } from 'utils';

/**
 * Item category bulk delete alerts.
 */
function ItemCategoryBulkDeleteAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { itemCategoriesIds },

  // #withItemCategoriesActions
  requestDeleteBulkItemCategories,

  // #withAlertActions
  closeAlert,
}) {
  const { formatMessage } = useIntl();

  // handle cancel bulk delete alert.
  const handleCancelBulkDelete = () => {
    closeAlert(name);
  };

  // handle confirm itemCategories bulk delete.
  const handleConfirmBulkDelete = () => {
    requestDeleteBulkItemCategories(itemCategoriesIds)
      .then(() => {
        closeAlert(name);
        AppToaster.show({
          message: formatMessage({
            id: 'the_item_categories_has_been_deleted_successfully',
          }),
          intent: Intent.SUCCESS,
        });
      })
      .catch((errors) => {
        closeAlert(name);
      });
  };
  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={
        <T id={'delete_count'} values={{ count: itemCategoriesIds.length }} />
      }
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelBulkDelete}
      onConfirm={handleConfirmBulkDelete}
    >
      <p>
        <FormattedHTMLMessage
          id={
            'once_delete_these_item_categories_you_will_not_able_restore_them'
          }
        />
      </p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
  withItemCategoriesActions,
)(ItemCategoryBulkDeleteAlert);