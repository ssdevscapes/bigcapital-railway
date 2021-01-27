import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useQuery, queryCache } from 'react-query';
import { Alert, Intent } from '@blueprintjs/core';

import 'style/pages/SaleInvoice/List.scss';

import AppToaster from 'components/AppToaster';
import { FormattedMessage as T, useIntl } from 'react-intl'
;
import DashboardPageContent from 'components/Dashboard/DashboardPageContent';
import DashboardInsider from 'components/Dashboard/DashboardInsider';

import InvoicesDataTable from './InvoicesDataTable';
import InvoiceActionsBar from './InvoiceActionsBar';
import InvoiceViewTabs from './InvoiceViewTabs';

import withDashboardActions from 'containers/Dashboard/withDashboardActions';
import withResourceActions from 'containers/Resources/withResourcesActions';
import withInvoices from './withInvoices';
import withInvoiceActions from './withInvoiceActions';
import withViewsActions from 'containers/Views/withViewsActions';

import { compose } from 'utils';

/**
 * Invoices list.
 */
function InvoicesList({
  // #withDashboardActions
  changePageTitle,

  // #withViewsActions
  requestFetchResourceViews,
  requestFetchResourceFields,

  //#withInvoice
  invoicesTableQuery,
  invoicesViews,

  //#withInvoiceActions
  requestFetchInvoiceTable,
  requestDeleteInvoice,
  requestDeliverInvoice,
  addInvoiceTableQueries,
}) {
  const history = useHistory();
  const { formatMessage } = useIntl();
  const [deleteInvoice, setDeleteInvoice] = useState(false);
  const [deliverInvoice, setDeliverInvoice] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    changePageTitle(formatMessage({ id: 'invoices_list' }));
  }, [changePageTitle, formatMessage]);

  const fetchResourceViews = useQuery(
    ['resource-views', 'sale_invoice'],
    (key, resourceName) => requestFetchResourceViews(resourceName),
  );

  const fetchResourceFields = useQuery(
    ['resource-fields', 'sale_invoice'],
    (key, resourceName) => requestFetchResourceFields(resourceName),
  );

  const fetchInvoices = useQuery(
    ['invoices-table', invoicesTableQuery],
    (key, query) => requestFetchInvoiceTable({ ...query }),
  );
  //handle dalete Invoice
  const handleDeleteInvoice = useCallback(
    (invoice) => {
      setDeleteInvoice(invoice);
    },
    [setDeleteInvoice],
  );

  // handle cancel Invoice
  const handleCancelInvoiceDelete = useCallback(() => {
    setDeleteInvoice(false);
  }, [setDeleteInvoice]);

  const handleDeleteErrors = (errors) => {
    if (
      errors.find(
        (error) => error.type === 'INVOICE_HAS_ASSOCIATED_PAYMENT_ENTRIES',
      )
    ) {
      AppToaster.show({
        message: formatMessage({
          id: 'the_invoice_cannot_be_deleted',
        }),
        intent: Intent.DANGER,
      });
    }
  };

  // handleConfirm delete invoice
  const handleConfirmInvoiceDelete = useCallback(() => {
    requestDeleteInvoice(deleteInvoice.id)
      .then(() => {
        setDeleteInvoice(false);
        AppToaster.show({
          message: formatMessage({
            id: 'the_invoice_has_been_deleted_successfully',
          }),
          intent: Intent.SUCCESS,
        });
      })
      .catch((errors) => {
        handleDeleteErrors(errors);
        setDeleteInvoice(false);
      });
  }, [deleteInvoice, requestDeleteInvoice, formatMessage]);
  
  // Handle cancel/confirm invoice deliver.
  const handleDeliverInvoice = useCallback((invoice) => {
    setDeliverInvoice(invoice);
  }, []);

  // Handle cancel deliver invoice alert.
  const handleCancelDeliverInvoice = useCallback(() => {
    setDeliverInvoice(false);
  }, []);

  // Handle confirm invoiec deliver.
  const handleConfirmInvoiceDeliver = useCallback(() => {
    requestDeliverInvoice(deliverInvoice.id)
      .then(() => {
        setDeliverInvoice(false);
        AppToaster.show({
          message: formatMessage({
            id: 'the_invoice_has_been_delivered_successfully',
          }),
          intent: Intent.SUCCESS,
        });
        queryCache.invalidateQueries('invoices-table');
      })
      .catch((error) => {
        // setDeliverInvoice(false);
      });
  }, [deliverInvoice, requestDeliverInvoice, formatMessage]);

  const handleEditInvoice = useCallback((invoice) => {
    history.push(`/invoices/${invoice.id}/edit`);
  });

  // Calculates the selected rows count.
  const selectedRowsCount = useMemo(() => Object.values(selectedRows).length, [
    selectedRows,
  ]);

  // Handle filter change to re-fetch data-table.
  const handleFilterChanged = useCallback(() => {}, []);

  // Handle selected rows change.
  const handleSelectedRowsChange = useCallback(
    (_invoices) => {
      setSelectedRows(_invoices);
    },
    [setSelectedRows],
  );
  return (
    <DashboardInsider
      loading={fetchResourceViews.isFetching || fetchResourceFields.isFetching}
      name={'sales-invoices-list'}
    >
      <InvoiceActionsBar
        // onBulkDelete={}
        selectedRows={selectedRows}
        onFilterChanged={handleFilterChanged}
      />
      <DashboardPageContent>
        <Switch>
          <Route
            exact={true}
            path={['/invoices/:custom_view_id/custom_view', '/invoices']}
          >
            <InvoiceViewTabs />
            <InvoicesDataTable
              onDeleteInvoice={handleDeleteInvoice}
              onEditInvoice={handleEditInvoice}
              onDeliverInvoice={handleDeliverInvoice}
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          </Route>
        </Switch>

        <Alert
          cancelButtonText={<T id={'cancel'} />}
          confirmButtonText={<T id={'delete'} />}
          icon={'trash'}
          intent={Intent.DANGER}
          isOpen={deleteInvoice}
          onCancel={handleCancelInvoiceDelete}
          onConfirm={handleConfirmInvoiceDelete}
        >
          <p>
            <T id={'once_delete_this_invoice_you_will_able_to_restore_it'} />
          </p>
        </Alert>
        <Alert
          cancelButtonText={<T id={'cancel'} />}
          confirmButtonText={<T id={'deliver'} />}
          intent={Intent.WARNING}
          isOpen={deliverInvoice}
          onCancel={handleCancelDeliverInvoice}
          onConfirm={handleConfirmInvoiceDeliver}
        >
          <p>
            <T id={'are_sure_to_deliver_this_invoice'} />
          </p>
        </Alert>
      </DashboardPageContent>
    </DashboardInsider>
  );
}

export default compose(
  withResourceActions,
  withInvoiceActions,
  withDashboardActions,
  withViewsActions,
  withInvoices(({ invoicesTableQuery }) => ({
    invoicesTableQuery,
  })),
)(InvoicesList);