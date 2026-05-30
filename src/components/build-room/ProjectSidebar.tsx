import type { BuildRoomCopy } from "@/features/i18n/dictionary";
import type { ProjectSummary } from "./BuildRoom";

export function ProjectSidebar({ projects, copy }: { projects: ProjectSummary[]; copy: BuildRoomCopy }) {
  return (
    <aside className="panel side-panel">
      <div className="brand-mark">
        <h1>{copy.brandName}</h1>
        <span className="status-pill">{copy.mvp}</span>
      </div>
      <p className="section-title">{copy.projects}</p>
      <div className="project-list">
        {projects.length === 0 ? <p style={{ color: "var(--muted)", margin: 0 }}>{copy.noBuilds}</p> : null}
        {projects.map((project) => (
          <article key={project.id} className="card project-card">
            <strong>{project.name}</strong>
            <div className="project-meta">
              <span>{copy.projectStatus[project.status as keyof typeof copy.projectStatus] ?? project.status}</span>
              <span>{project.versions[0] ? `v${project.versions[0].versionNumber}` : copy.noVersion}</span>
              {project.publishes[0] ? <span>/{project.publishes[0].slug}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

