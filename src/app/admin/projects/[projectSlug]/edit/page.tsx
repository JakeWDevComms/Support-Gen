import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/project-editor";
import { getProject } from "@/lib/projects";

export default async function EditProjectPage({params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)notFound();

  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7">
        <Link href="/" className="text-sm font-bold text-[#006f78] hover:underline">← Projects</Link>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#173136]">Edit {project.schemeName}</h1>
        <p className="mt-2 text-[#657376]">Update the project configuration without changing application code.</p>
      </div>
      <ProjectEditor mode="edit" initial={project} databaseReady={Boolean(process.env.DATABASE_URL)}/>
    </div>
  </main>;
}
