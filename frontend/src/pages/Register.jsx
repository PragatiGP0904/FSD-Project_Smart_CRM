import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout, PasswordField } from '@/pages/Login';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage, isLiveApiConfigured } from '@/services/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLiveApiConfigured) {
    return (
      <AuthLayout
        title="Sample preview"
        subtitle="Account creation is unavailable in this frontend-only demo."
        footer={<Link className="text-primary" to="/login">Back to sign in</Link>}
      >
        <p className="rounded-lg border border-line bg-background px-3 py-2 text-sm text-muted">
          The public preview uses example data and does not create accounts or save changes.
        </p>
      </AuthLayout>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Enter your name.');
      return;
    }
    if (password.length < 6) {
      setError('Use at least 6 characters for the password.');
      return;
    }
    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'The account could not be created.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Your records stay private to this login."
      footer={<>Already registered? <Link className="text-primary" to="/login">Sign in</Link></>}
    >
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Name" htmlFor="name">
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
        </Field>
        <Field label="Email" htmlFor="register-email">
          <Input id="register-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </Field>
        <PasswordField id="register-password" label="Password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="rounded-lg border border-danger/30 bg-surface px-3 py-2 text-sm text-danger" role="alert">{error}</p> : null}
        <Button className="w-full" type="submit" disabled={loading}>{loading ? 'Creating account' : 'Create account'}</Button>
      </form>
    </AuthLayout>
  );
}
