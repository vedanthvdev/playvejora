import Link from "next/link";
import { home, howItWorks } from "@/lib/site-copy";

export default function HowItWorksPage() {
  return (
    <>
      <div className="page-head">
        <span className="kicker">Registration</span>
        <h1>{howItWorks.title}</h1>
        <p>{howItWorks.lede}</p>
      </div>

      <div className="cards">
        {howItWorks.steps.map((step, index) => (
          <article className="card" key={step.title}>
            <span className="step-no">{index + 1}</span>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>

      <section className="section">
        <div className="section-head">
          <h2>The rules of entry</h2>
        </div>
        <ul className="rules">
          {howItWorks.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="callout">
          <strong>{howItWorks.notes.title}</strong>
          <p>{howItWorks.notes.body}</p>
        </div>
      </section>

      <section className="band">
        <h2>Ready when you are</h2>
        <p>{home.closing.body}</p>
        <Link className="btn btn-primary" href="/register">
          {home.cta}
        </Link>
      </section>
    </>
  );
}
