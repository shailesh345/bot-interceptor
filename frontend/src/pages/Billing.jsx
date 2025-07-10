import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBilling } from '../store/slices/billingSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Billing = () => {
  const dispatch = useDispatch()
  const { subscription, invoices, loading, error } = useSelector((state) => state.billing)

  useEffect(() => {
    dispatch(fetchBilling())
  }, [dispatch])

  return (
    <>
      <Helmet>
        <title>Billing - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your subscription and billing information.
          </p>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600">{error}</div>
            ) : subscription ? (
              <div>
                <div className="mb-2"><b>Plan:</b> {subscription.planName}</div>
                <div className="mb-2"><b>Status:</b> {subscription.status}</div>
                <div className="mb-2"><b>Current Period:</b> {subscription.currentPeriodStart} - {subscription.currentPeriodEnd}</div>
                <div className="mb-2"><b>Amount:</b> ${subscription.amount} {subscription.currency}</div>
                <div className="mb-2"><b>Next Billing:</b> {subscription.nextBilling}</div>
              </div>
            ) : (
              <div>No subscription data available.</div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Invoices</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600">{error}</div>
            ) : invoices && invoices.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Number</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Created</th>
                    <th className="table-header">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id}>
                      <td className="table-cell">{inv.number}</td>
                      <td className="table-cell">{inv.status}</td>
                      <td className="table-cell">${inv.amount} {inv.currency}</td>
                      <td className="table-cell">{inv.created}</td>
                      <td className="table-cell">{inv.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div>No invoices found.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Billing
