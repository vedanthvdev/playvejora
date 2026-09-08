import type { Metadata } from "next";
import { waiverText } from "@/content/waiver";
import { listOpenCompetitions } from "@/lib/competitions";
import { RegisterWizard } from "./RegisterWizard";

export const metadata: Metadata = {
  title: "Register a team",
  description:
    "Pick an open league if more than one is running, then a captain registers the whole side. No player logins, and nothing is charged on this site yet.",
  alternates: { canonical: "/register" },
};

// The open leagues come from D1 per request, so there is nothing to prerender.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const competitions = await listOpenCompetitions();

  return (
    <div className="wrap page-top">
      <div className="page-head">
        <span className="kicker">Join a league</span>
        <h1>Register a team</h1>
        <p>
          Pick the sport and city only when more than one is open, then one
          captain completes the form for the whole side.
        </p>
      </div>
      <RegisterWizard waiverText={waiverText} competitions={competitions} />
    </div>
  );
}
