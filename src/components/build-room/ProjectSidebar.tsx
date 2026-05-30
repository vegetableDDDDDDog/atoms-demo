import type { ProjectSummary } from "./BuildRoom";

export function ProjectSidebar({ projects }: { projects: ProjectSummary[] }) {
  return (
    <aside className="panel side-panel">
      <div className="brand-mark">
        <h1>Atoms Mini</h1>
        <span className="status-pill">MVP</span>
      </div>
      <p className="section-title">Projects</p>
      <div className="project-list">
        {projects.length === 0 ? <p style={{ color: "var(--muted)", margin: 0 }}>No builds yet.</p> : null}
        {projects.map((project) => (
          <article key={project.id} className="card project-card">
            <strong>{project.name}</strong>
            <div className="project-meta">
              <span>{project.status}</span>
              <span>{project.versions[0] ? `v${project.versions[0].versionNumber}` : "no version"}</span>
              {project.publishes[0] ? <span>/{project.publishes[0].slug}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
