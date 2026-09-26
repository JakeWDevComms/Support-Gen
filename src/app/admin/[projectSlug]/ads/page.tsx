import Link from "next/link";
import { notFound } from "next/navigation";
import { AdStudio } from "@/components/ad-studio";
import { getProject } from "@/lib/projects";

export default async function AdsPage({params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)notFound();

  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-bold text-[#006f78] hover:underline">← Projects</Link>
        <Link href={`/admin/projects/${project.slug}/edit`} className="rounded-xl border border-[#cbd8d4] bg-white px-4 py-2.5 text-sm font-bold text-[#30494e]">Edit project</Link>
      </div>
      <AdStudio project={project} aiReady={Boolean(process.env.OPENAI_API_KEY)}/>
    </div>
  </main>;
}
