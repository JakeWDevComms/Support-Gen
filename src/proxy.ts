import { NextResponse,type NextRequest } from "next/server";
import { getProject } from "@/lib/projects";
export function proxy(request:NextRequest){const response=NextResponse.next(),first=request.nextUrl.pathname.split("/").filter(Boolean)[0],project=first?getProject(first):undefined;if(project){const ancestors=["'self'",...(project.embedOrigins??[])].join(" ");response.headers.set("Content-Security-Policy",`frame-ancestors ${ancestors};`);}response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");response.headers.set("X-Content-Type-Options","nosniff");return response;}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
