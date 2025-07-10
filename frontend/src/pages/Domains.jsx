import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDomains, createDomain } from '../store/slices/domainsSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Domains = () => {
  const dispatch = useDispatch()
  const { domains, loading, error } = useSelector((state) => state.domains)
  const [domainName, setDomainName] = useState('')
  const [editDomainId, setEditDomainId] = useState(null)
  const [editDomainName, setEditDomainName] = useState('')

  useEffect(() => {
    dispatch(fetchDomains())
  }, [dispatch])

  const handleAddDomain = (e) => {
    e.preventDefault()
    if (domainName) {
      dispatch(createDomain({ domain_name: domainName }))
      setDomainName('')
    }
  }

  const handleEditDomain = (domain) => {
    setEditDomainId(domain.id)
    setEditDomainName(domain.domain_name)
  }

  const handleUpdateDomain = (e) => {
    e.preventDefault()
    if (editDomainName) {
      // Dispatch a mock update action (to be implemented in mockAPI and slice)
      dispatch({ type: 'domains/updateDomain', payload: { id: editDomainId, domain_name: editDomainName } })
      setEditDomainId(null)
      setEditDomainName('')
    }
  }

  const handleDeleteDomain = (id) => {
    // Dispatch a mock delete action (to be implemented in mockAPI and slice)
    dispatch({ type: 'domains/deleteDomain', payload: id })
  }

  return (
    <>
      <Helmet>
        <title>Domains - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Domains</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your protected domains and their configurations.
          </p>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Your Domains</h3>
            <form className="flex space-x-2" onSubmit={handleAddDomain}>
              <input
                type="text"
                className="input"
                placeholder="Add new domain (e.g. example.com)"
                value={domainName}
                onChange={e => setDomainName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600">{error}</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Domain</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">SSL</th>
                    <th className="table-header">Requests</th>
                    <th className="table-header">Bots</th>
                    <th className="table-header">Blocked</th>
                    <th className="table-header">Revenue</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {domains.map((domain) => (
                    <tr key={domain.id}>
                      <td className="px-4 py-2">
                        {editDomainId === domain.id ? (
                          <form onSubmit={handleUpdateDomain} className="flex space-x-2">
                            <input
                              className="input input-bordered"
                              value={editDomainName}
                              onChange={(e) => setEditDomainName(e.target.value)}
                            />
                            <button className="btn btn-primary btn-sm" type="submit">Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditDomainId(null)}>Cancel</button>
                          </form>
                        ) : (
                          <span>{domain.domain_name}</span>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${domain.status === 'active' ? 'badge-success' : domain.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>{domain.status}</span>
                      </td>
                      <td className="table-cell">{domain.sslEnabled ? 'Yes' : 'No'}</td>
                      <td className="table-cell">{domain.totalRequests}</td>
                      <td className="table-cell">{domain.botRequests}</td>
                      <td className="table-cell">{domain.blockedRequests}</td>
                      <td className="table-cell">${domain.revenue}</td>
                      <td className="px-4 py-2 text-right">
                        <button className="btn btn-ghost btn-xs mr-2" onClick={() => handleEditDomain(domain)}>Edit</button>
                        <button className="btn btn-error btn-xs" onClick={() => handleDeleteDomain(domain.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Domains
