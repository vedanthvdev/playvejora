import fs from "node:fs";
import path from "node:path";
import { RegisterWizard } from "./RegisterWizard";

export default function RegisterPage() {
  const waiverText = fs.readFileSync(
    path.join(process.cwd(), "content", "waiver.md"),
    "utf8",
  );

  return (
    <>
      <div className="page-head">
        <span className="kicker">Season one · Edinburgh</span>
        <h1>Register a team</h1>
        <p>
          One captain completes this for the whole side. Players do not create
          logins, and nothing is charged on this site yet.
        </p>
      </div>
      <RegisterWizard waiverText={waiverText} />
    </>
  );
}
