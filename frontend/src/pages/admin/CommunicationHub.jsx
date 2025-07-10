import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const mockMessages = [
  { id: 1, from: 'Admin', to: 'Acme Corp', type: 'email', content: 'Welcome to Traffic Interceptor!', time: '2025-07-10 10:00' },
  { id: 2, from: 'Admin', to: 'Beta Inc', type: 'sms', content: 'Your trial is ending soon.', time: '2025-07-09 15:30' },
];

const CommunicationHub = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [form, setForm] = useState({ to: '', type: 'email', content: '' });
  const handleSend = e => {
    e.preventDefault();
    setMessages([{ id: Date.now(), from: 'Admin', ...form, time: new Date().toISOString() }, ...messages]);
    setForm({ to: '', type: 'email', content: '' });
  };
  return (
    <>
      <Helmet><title>Communication Hub</title></Helmet>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Client Communication Hub</h1>
        <p>In-app messaging, email automation, and notification system UI will be implemented here.</p>
        <form className="flex space-x-2 mb-4" onSubmit={handleSend}>
          <input className="input input-bordered" placeholder="To (client)" value={form.to} onChange={e=>setForm(f=>({...f,to:e.target.value}))} />
          <select className="input input-bordered" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="in-app">In-App</option>
          </select>
          <input className="input input-bordered" placeholder="Message" value={form.content} onChange={e=>setForm(f=>({...f,content:e.target.value}))} />
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
        <table className="table w-full">
          <thead><tr><th>From</th><th>To</th><th>Type</th><th>Content</th><th>Time</th></tr></thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td>{m.from}</td><td>{m.to}</td><td>{m.type}</td><td>{m.content}</td><td>{m.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default CommunicationHub;
