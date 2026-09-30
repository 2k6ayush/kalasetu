import Head from 'next/head';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/AuthContext';
import Link from 'next/link';

export default function Register() {
  const { register } = useContext(AuthContext);
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    // Auto-format handle if they forgot the @
    let formattedHandle = handle.trim();
    if (!formattedHandle.startsWith('@')) {
      formattedHandle = `@${formattedHandle}`;
    }

    const res = await register(name, email, formattedHandle, password);
    if (!res.success) {
      setError(res.error || 'Failed to create account');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up — Kalāsetu</title>
      </Head>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="form-card" style={{ maxWidth: '400px', width: '100%', padding: '40px', textAlign: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
            <h1 className="navbar-brand" style={{ fontSize: '2rem', marginBottom: '8px' }}>Kalāsetu</h1>
          </Link>
          <p className="page-subtitle" style={{ marginBottom: '32px' }}>Create your creator account</p>
          
          {error && <div style={{ color: 'red', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleSignUp} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                id="name" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name" 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                required 
              />
            </div>
            <div className="form-group">
              <label htmlFor="handle">Creator Handle</label>
              <input 
                id="handle" 
                type="text" 
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@username" 
                required 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '32px' }}>
              <label htmlFor="password">Password</label>
              <input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password" 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Sign Up
            </button>
          </form>
          <div style={{ marginTop: '24px' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              Already have an account? <Link href="/login" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
