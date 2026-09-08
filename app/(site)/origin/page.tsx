import type { Metadata } from "next";
import { origin } from "@/lib/site-copy";

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
    </>
  );
}
