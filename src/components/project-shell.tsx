import Image from "next/image";
import Link from "next/link";
import type { CSSProperties,ReactNode } from "react";
import type { ProjectConfig } from "@/projects/types";

export function ProjectShell({project,children}:{project:ProjectConfig;children:ReactNode}){
  const style={
    "--project-primary":project.theme.primary,
    "--project-dark":project.theme.primaryDark,
    "--project-accent":project.theme.accent,
    "--project-bg":project.theme.background
  } as CSSProperties;

  return <main style={style} className="min-h-screen overflow-x-hidden bg-[var(--project-bg)] text-[#173136]">
    <header className="relative overflow-hidden bg-[var(--project-dark)] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{background:"radial-gradient(circle at 85% 10%, rgba(255,255,255,.28), transparent 30%), radial-gradient(circle at 10% 100%, rgba(255,255,255,.12), transparent 34%)"}}/>
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 md:px-8">
        <Link href={`/${project.slug}`} className="group flex min-w-0 items-center gap-4">
          {project.theme.logoUrl ? <div className="flex h-12 w-28 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
            <Image src={project.theme.logoUrl} alt={`${project.clientName} logo`} width={112} height={48} className="max-h-9 w-auto object-contain"/>
          </div> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg font-black ring-1 ring-white/15">{project.clientName.slice(0,1)}</div>}
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">{project.clientName}</p>
            <p className="mt-1 truncate text-base font-bold md:text-lg">{project.schemeName}</p>
          </div>
        </Link>
        <div className="hidden shrink-0 rounded-full bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 ring-1 ring-white/15 sm:block">Planning ref: {project.applicationReference}</div>
      </div>
    </header>

    {children}

    <footer className="border-t border-black/5 bg-white/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-sm text-[#637174] md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <p className="font-semibold text-[#40575c]">{project.schemeName}</p>
          <p className="mt-1 text-xs">Planning application {project.applicationReference}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href={`/${project.slug}/privacy`} className="font-semibold hover:underline">Privacy</Link>
          <span className="text-[#a3aeaf]">•</span>
          <span>Powered by {project.dataProcessor}</span>
        </div>
      </div>
    </footer>
  </main>;
}
