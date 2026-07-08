const featureCards = [
  {
    title: "GitHub Codespaces",
    text: "Develop and preview the React app inside a GitHub-hosted development container."
  },
  {
    title: "React + Vite",
    text: "Use a fast modern front-end stack with simple npm scripts for dev, build, and preview."
  },
  {
    title: "Container-ready",
    text: "Build the static app into an nginx container image when you want to deploy it elsewhere."
  }
];

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">GitHub demo project</p>
        <h1 id="page-title">Hello World from React.js</h1>
        <p className="lede">
          This sample app runs inside GitHub Codespaces and demonstrates the clean separation
          between development containers, static site hosting, and production container deployment.
        </p>
        <div className="button-row" aria-label="Demo actions">
          <a className="button primary" href="https://github.com/features/codespaces">
            Learn Codespaces
          </a>
          <a className="button secondary" href="https://vite.dev/guide/">
            Vite Guide
          </a>
        </div>
      </section>

      <section className="cards" aria-label="Demo capabilities">
        {featureCards.map((card) => (
          <article className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
