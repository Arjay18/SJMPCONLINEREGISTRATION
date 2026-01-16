import Head from 'next/head';
import { useState } from 'react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxOfWPk6frEp6l0XaPiR-q8NvUnDG3hHHzyhkoENa41C4fADnLgvOTBR5jxZ2nowvSa8Q/exec';

export default function Home() {
  const [fullName, setFullName] = useState('');
  const [msg, setMsg] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim()) {
      setMsg('Please enter full name');
      setCoupon(null);
      return;
    }
    setLoading(true);
    setMsg('Searching...');
    setCoupon(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'search', full_name: fullName })
      });
      if (!res.ok) throw new Error('Network error: ' + res.status);
      const data = await res.json();
      if (!data.found) {
        setMsg('Member not found');
        setLoading(false);
        return;
      }
      if (data.registered === 'YES') {
        setMsg('Already registered');
        setLoading(false);
        return;
      }
      setMsg('Registering...');
      const regRes = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'register', full_name: fullName })
      });
      if (!regRes.ok) throw new Error('Network error: ' + regRes.status);
      const regData = await regRes.json();
      if (!regData.success) {
        setMsg(regData.message || 'Registration failed');
        setLoading(false);
        return;
      }
      setMsg('Registration successful!');
      setCoupon({
        name: regData.full_name,
        date: new Date(regData.registered_at).toLocaleString(),
        id: regData.member_id
      });
    } catch (err) {
      setMsg('Error: ' + err.message + '\nPlease check your internet connection or contact admin.');
    }
    setLoading(false);
  };

  const couponText = coupon ? `\n--------------------------------\n  MEMBER REGISTRATION COUPON\n--------------------------------\n  Name: ${coupon.name}\n  Date: ${coupon.date}\n  Coupon No: ${coupon.id}\n--------------------------------\n  THANK YOU\n--------------------------------\n` : '';

  return (
    <div style={{ maxWidth: 400, margin: '2em auto', background: '#fff', padding: '2em', borderRadius: 10, boxShadow: '0 2px 8px #ccc', fontFamily: 'sans-serif' }}>
      <Head>
        <title>Member Registration</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <h1 style={{ fontSize: '1.5em', textAlign: 'center' }}>Member Registration</h1>
      <input
        type="text"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        placeholder="Full Name"
        required
        style={{ width: '100%', fontSize: '1.2em', margin: '1em 0', padding: '0.7em', borderRadius: 5, border: '1px solid #ccc' }}
      />
      <button
        onClick={handleRegister}
        disabled={loading}
        style={{ width: '100%', fontSize: '1.2em', margin: '1em 0', padding: '0.7em', borderRadius: 5, background: '#007bff', color: '#fff', border: 'none', fontWeight: 'bold' }}
      >
        {loading ? 'Processing...' : 'Search & Register'}
      </button>
      <div style={{ textAlign: 'center', fontSize: '1.1em', margin: '1em 0' }}>{msg}</div>
      {coupon && (
        <pre style={{ fontFamily: 'monospace', background: '#eee', padding: '1em', borderRadius: 5, margin: '1em 0', fontSize: '16px' }}>{couponText}</pre>
      )}
    </div>
  );
}
