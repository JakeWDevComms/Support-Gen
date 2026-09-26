import Link from "next/link";
import { ProjectEditor } from "@/components/project-editor";

export default function NewProjectPage(){
  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-10">
    <div className="mx-auto max-w-7xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm font-bold text-[#006f78] hover:underline">← Projects</Link>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#173136]">Create new project</h1>
          <p className="mt-2 max-w-2xl text-[#657376]">Set up the resident tool, support reasons, planning recipients, branding and Reach campaign in one place.</p>
        </div>
      </div>
      <ProjectEditor mode="create" databaseReady={Boolean(process.env.DATABASE_URL)}/>
    </div>
  </main>;
}
