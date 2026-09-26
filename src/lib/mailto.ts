import type { ProjectConfig } from "@/projects/types";
export const MAILTO_SAFE_LIMIT=1800;
export function buildMailto(project:ProjectConfig,letter:string){const params=new URLSearchParams();if(project.planningAuthority.cc?.length)params.set("cc",project.planningAuthority.cc.join(","));params.set("subject",project.letter.subject);params.set("body",letter);const url=`mailto:${project.planningAuthority.to.join(",")}?${params.toString()}`;return{url,safe:url.length<=MAILTO_SAFE_LIMIT};}
