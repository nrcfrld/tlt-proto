import { useState, type FormEvent } from "react";
import { BrandMark } from "../components/BrandMark";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("owner@tlt.com");
  const [password, setPassword] = useState("Prototype123!");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onLogin();
  }

  return (
    <main className="login-page">
      <div className="login-content">
        <div className="brand login-brand">
          <BrandMark />
        </div>
        <section className="login-panel" aria-labelledby="login-title">
          <p className="login-notice">PROTOTYPE - All Data is Dummy</p>
          <h1 id="login-title">Login</h1>
          <p className="login-description">Your demo credentials are ready. Log in to explore the workspace.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="login-email">Email</label>
            <input id="login-email" name="email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="login-password">Password</label>
            <input id="login-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="login-submit" type="submit">Login</button>
          </form>
        </section>
      </div>
    </main>
  );
}
