import React, { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRules, createRule } from '../store/slices/rulesSlice'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Rules = () => {
  const dispatch = useDispatch()
  const { rules, loading, error } = useSelector((state) => state.rules)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', type: 'bot_detection' })
  const [editRuleId, setEditRuleId] = useState(null)
  const [editRule, setEditRule] = useState({ name: '', description: '', type: 'bot_detection' })

  useEffect(() => {
    dispatch(fetchRules('1')) // Use mock domainId
  }, [dispatch])

  const handleAddRule = (e) => {
    e.preventDefault()
    if (form.name && form.type) {
      dispatch(createRule({ domainId: '1', ruleData: form }))
      setForm({ name: '', description: '', type: 'bot_detection' })
      setShowForm(false)
    }
  }

  const handleEditRule = (rule) => {
    setEditRuleId(rule.id)
    setEditRule({ name: rule.name, description: rule.description, type: rule.type })
  }

  const handleUpdateRule = (e) => {
    e.preventDefault()
    if (editRule.name && editRule.type) {
      // Dispatch a mock update action (to be implemented in mockAPI and slice)
      dispatch({ type: 'rules/updateRule', payload: { id: editRuleId, ruleData: editRule } })
      setEditRuleId(null)
      setEditRule({ name: '', description: '', type: 'bot_detection' })
    }
  }

  const handleDeleteRule = (id) => {
    // Dispatch a mock delete action (to be implemented in mockAPI and slice)
    dispatch({ type: 'rules/deleteRule', payload: id })
  }

  return (
    <>
      <Helmet>
        <title>Rules - Traffic Interceptor</title>
      </Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interceptor Rules</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configure traffic interception rules and bot behavior policies.
          </p>
        </div>
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Rules</h3>
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : 'Add Rule'}
            </button>
          </div>
          <div className="card-body">
            {showForm && (
              <form className="mb-4 space-y-2" onSubmit={handleAddRule}>
                <input
                  type="text"
                  className="input"
                  placeholder="Rule name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Description"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
                <select
                  className="input"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                >
                  <option value="bot_detection">Bot Detection</option>
                  <option value="rate_limit">Rate Limit</option>
                  <option value="content_protection">Content Protection</option>
                </select>
                <button type="submit" className="btn btn-success">Save Rule</button>
              </form>
            )}
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="p-4 bg-red-50 text-red-600">{error}</div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Active</th>
                    <th className="table-header">Priority</th>
                    <th className="table-header">Matched</th>
                    <th className="table-header">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>
                      <td className="px-4 py-2">
                        {editRuleId === rule.id ? (
                          <form onSubmit={handleUpdateRule} className="flex space-x-2">
                            <input
                              className="input input-bordered"
                              value={editRule.name}
                              onChange={(e) => setEditRule({ ...editRule, name: e.target.value })}
                            />
                            <input
                              className="input input-bordered"
                              value={editRule.description}
                              onChange={(e) => setEditRule({ ...editRule, description: e.target.value })}
                            />
                            <button className="btn btn-primary btn-sm" type="submit">Save</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEditRuleId(null)}>Cancel</button>
                          </form>
                        ) : (
                          <span>{rule.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button className="btn btn-ghost btn-xs mr-2" onClick={() => handleEditRule(rule)}>Edit</button>
                        <button className="btn btn-error btn-xs" onClick={() => handleDeleteRule(rule.id)}>Delete</button>
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

export default Rules
