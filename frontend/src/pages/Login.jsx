import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { LogoLockup } from '@/components/brand/Logo';
import { SignInStory } from '@/components/brand/SignInStory';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/api';

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
      <section className="relative min-h-[320px] overflow-hidden lg:min-h-screen">
        <SignInStory />
      </section>
      <section className="flex items-center justify-center bg-surface px-5 py-10 sm:px-10">
        <div className="auth-form w-full max-w-[360px]">
          <LogoLockup />
          <h2 className="mt-8 text-2xl font-semibold tracking-heading">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-sm text-muted">{footer}</div>
        </div>
      </section>
    </div>
  );
}

export function PasswordField({ value, onChange, id, label = 'Password', autoComplete = 'current-password' }) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label} htmlFor={id}>
      <div className="relative">
        <Input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} className="h-11 pr-10" />
        <button
          type="button"
          className="absolute right-2 top-2 rounded-md p-1 text-muted"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
        </button>
      </div>
    </Field>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Sign in failed. Check the email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to open the people, conversations, and calls waiting for you."
      footer={<>Need an account? <Link className="font-medium text-primary" to="/register">Create one</Link></>}
    >
      <form className="space-y-4" onSubmit={submit}>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11"
            placeholder="you@studio.com"
          />
        </Field>
        <PasswordField id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="rounded-lg border border-danger/30 bg-background px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        <Button className="h-11 w-full" type="submit" disabled={loading}>{loading ? 'Signing in' : 'Sign in'}</Button>
        <Button
          className="h-11 w-full"
          variant="secondary"
          onClick={() => {
            setEmail('demo@smartcrm.com');
            setPassword('Demo@123');
          }}
        >
          Use demo account
        </Button>
      </form>
    </AuthLayout>
  );
}
