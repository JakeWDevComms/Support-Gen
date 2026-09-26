import { notFound } from "next/navigation";
import { ProjectShell } from "@/components/project-shell";
import { SupportForm } from "@/components/support-form";
import { getProject } from "@/lib/projects";

export default async function ProjectPage({params,searchParams}:{params:Promise<{projectSlug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const {projectSlug}=await params,project=getProject(projectSlug);
  if(!project)notFound();

  const query=await searchParams;
  const get=(key:string)=>typeof query[key]==="string"?query[key] as string:undefined;
  const tracking={
    utmSource:get("utm_source"),
    utmMedium:get("utm_medium"),
    utmCampaign:get("utm_campaign"),
    utmContent:get("utm_content"),
    utmTerm:get("utm_term"),
    reachCampaign:get("reach_campaign")
  };

  return <ProjectShell project={project}>
    <section className="relative overflow-hidden border-b border-black/5 bg-white">
      <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[var(--project-primary)] opacity-[0.055]"/>
      <div className="pointer-events-none absolute -bottom-32 left-[12%] h-64 w-64 rounded-full bg-[var(--project-accent)] opacity-[0.07]"/>
      <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--project-primary)]/8 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--project-primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--project-primary)]"/>
            Have your say
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.03em] text-[var(--project-dark)] md:text-6xl md:leading-[1.05]">Support {project.schemeName}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#5d6b6e] md:text-xl">{project.pitch}</p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-[#f2f6f4] px-4 py-2 font-semibold text-[#496065]">You choose what to include</span>
            <span className="rounded-full bg-[#f2f6f4] px-4 py-2 font-semibold text-[#496065]">Preview before sending</span>
            <span className="rounded-full bg-[#f2f6f4] px-4 py-2 font-semibold text-[#496065]">Sent from your own email</span>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-[#738184]">Your representation will be addressed to <strong className="font-semibold text-[#50666a]">{project.planningAuthority.name}</strong>. Nothing is sent automatically — you review the letter and decide whether to send it.</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
      <SupportForm project={project} tracking={tracking}/>
    </section>
  </ProjectShell>;
}
