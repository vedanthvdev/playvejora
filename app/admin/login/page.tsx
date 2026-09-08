import { PRE_LAUNCH_PASSWORD, usingPreLaunchPassword } from "@/lib/admin-auth";
import { loginAdminAction } from "./actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return <LoginForm searchParams={searchParams} />;
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Organizers only</span>
        <h1>Organizer login</h1>
        <p>Team intake for the Edinburgh season is behind this password.</p>
      </div>
      <div className="panel">
        <form className="form" action={loginAdminAction}>
          {params.error ? (
            <p className="error">That password did not match.</p>
          ) : null}
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required />
          {usingPreLaunchPassword() ? (
            <p className="hint">
              Pre-launch default: <code>{PRE_LAUNCH_PASSWORD}</code>. Set
              ADMIN_PASSWORD to replace it.
            </p>
          ) : null}
          <div className="form-actions">
            <button className="btn btn-solid" type="submit">
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
