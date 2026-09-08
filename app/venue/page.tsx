import { venue } from "@/lib/site-copy";

export default function VenuePage() {
  return (
    <>
      <div className="page-head">
        <span className="kicker">Where and how we play</span>
        <h1>{venue.title}</h1>
        <p>{venue.lede}</p>
      </div>

      <div className="cards">
        <article className="card">
          <h3>City</h3>
          <p>{venue.cityLine}</p>
        </article>
        <article className="card">
          <h3>Pitch</h3>
          <p>{venue.venueLine}</p>
        </article>
        <article className="card">
          <h3>Format</h3>
          <p>{venue.formatLine}</p>
        </article>
      </div>

      <section className="section">
        <div className="section-head">
          <h2>On the pitch</h2>
        </div>
        <ul className="rules">
          {venue.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>

      <section className="section">
        <div className="callout">
          <strong>{venue.safety.title}</strong>
          <p>{venue.safety.body}</p>
        </div>
      </section>
    </>
  );
}
