import Link from "next/link";
import { home } from "@/lib/site-copy";

export default function HomePage() {
  return (
    <>
      <section className="hero bleed">
        <div className="wrap hero-inner">
          <span className="kicker">{home.kicker}</span>
          <h1>{home.title}</h1>
          <p>{home.lede}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/register">
              {home.cta}
            </Link>
            <Link className="btn btn-ghost" href="/how-it-works">
              {home.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <div className="stats-band bleed">
        <dl className="wrap stats">
          {home.stats.map((stat) => (
            <div key={stat.term}>
              <dt>{stat.term}</dt>
              <dd>{stat.detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <section className="wrap section">
        <div className="section-head">
          <h2>How a team gets in</h2>
          <p>
            No accounts, no squad-size rules yet, and nothing to settle on this
            site.
          </p>
        </div>
        <div className="cards">
          {home.steps.map((step, index) => (
            <article className="card" key={step.title}>
              <span className="step-no">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="band bleed">
        <div className="wrap band-inner">
          <h2>{home.closing.title}</h2>
          <p>{home.closing.body}</p>
          <Link className="btn btn-primary" href="/register">
            {home.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
