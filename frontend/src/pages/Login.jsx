import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { ContextFollowUpCard } from '@/components/followups/ContextFollowUpCard';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/services/api';

const preview = {
  priority: 'High',
  status: 'Pending',
  dueDate: new Date(new Date().setHours(16, 30, 0, 0)).toISOString(),
  title: 'Call to check whether the quotation is acceptable',
  context: {
    name: 'Arjun Kumar',
    stage: 'Proposal',
    lastInteraction: 'Meeting: Quotation discussed with the customer',
    lastInteractionAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
};

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-[#101828] p-10 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold">S</span>
          <span className="text-sm font-semibold">Smart CRM</span>
        </div>
        <div className="max-w-md">
          <h1 className="text-xl font-semibold tracking-heading">Know what to say before you call.</h1>
          <p className="mt-2 text-sm text-[#C5CDDA]">Every follow-up keeps the customer, the stage, and the last conversation together.</p>
          <div className="mt-6">
            <ContextFollowUpCard item={preview} staticPreview />
          </div>
        </div>
        <p className="text-xs text-[#8B96AB]">For small businesses and individual salespeople.</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <span className="text-sm font-semibold">Smart CRM</span>
          </div>
          <h2 className="text-xl font-semibold tracking-heading">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
          <div className="mt-4 text-sm text-muted">{footer}</div>
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
        <Input id={id} type={visible ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} />
        <button
          type="button"
          className="absolute right-2 top-1.5 rounded-md p-1 text-muted"
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
      title="Sign in"
      subtitle="Open your workspace."
      footer={<>Need an account? <Link className="text-primary" to="/register">Create one</Link></>}
    >
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <PasswordField id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="rounded-lg border border-danger/30 bg-surface px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Signing in' : 'Sign in'}</Button>
        <Button
          className="w-full"
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
