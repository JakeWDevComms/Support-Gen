import Image from "next/image";
import type { CSSProperties,ReactNode } from "react";
import type { ProjectConfig } from "@/projects/types";

export function ProjectShell({project,children}:{project:ProjectConfig;children:ReactNode}){
  const style={
    "--project-primary":project.theme.primary,
    "--project-dark":project.theme.primaryDark,
    "--project-accent":project.theme.accent,
    "--project-bg":project.theme.background
  } as CSSProperties;

  return <main style={style} className="min-h-screen bg-[var(--project-bg)] text-[#173136]">
    <header className="border-b border-black/10 bg-[var(--project-dark)] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-5 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {project.theme.logoUrl ? <div className="flex h-12 w-28 shrink-0 items-center justify-center rounded-lg bg-white p-2">
            <Image src={project.theme.logoUrl} alt={`${project.clientName} logo`} width={112} height={48} className="max-h-9 w-auto object-contain"/>
          </div> : null}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">{project.clientName}</p>
            <p className="mt-1 truncate text-lg font-bold">{project.schemeName}</p>
          </div>
        </div>
        <div className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white/90">Ref: {project.applicationReference}</div>
      </div>
    </header>
    {children}
    <footer className="border-t border-black/10 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-[#637174] md:flex-row md:items-center md:justify-between md:px-8">
        <span>Representation tool for {project.schemeName}</span>
        <span>Built by {project.dataProcessor}</span>
      </div>
    </footer>
  </main>;
}
