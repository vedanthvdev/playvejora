import type { Metadata } from "next";
import Link from "next/link";
import { home, origin } from "@/lib/site-copy";

export const metadata: Metadata = {
  title: "Origin",
  description: origin.lede,
  alternates: { canonical: "/origin" },
  openGraph: {
    title: `${origin.title}`,
    description: origin.lede,
    url: "/origin",
  },
};

export default function OriginPage() {
  return (
    <>
      <div className="wrap page-top">
        <div className="page-head">
          <span className="kicker">{origin.kicker}</span>
          <h1>{origin.title}</h1>
          <p>{origin.lede}</p>
        </div>

        <div className="cards">
          {origin.story.map((block) => (
            <article className="card" key={block.title}>
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </article>
          ))}
        </div>
      </div>

      <section className="band bleed">
        <div className="wrap band-inner">
          <h2>{origin.closing.title}</h2>
          <p>{origin.closing.body}</p>
          <Link className="btn btn-primary" href="/register">
            {home.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
