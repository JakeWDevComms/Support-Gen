import { createHmac,timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
const COOKIE_NAME="support_gen_admin";const SESSION_MS=12*60*60*1000;
function sign(value:string){const secret=process.env.AUTH_SECRET;if(!secret)return "";return createHmac("sha256",secret).update(value).digest("hex");}
function safeEqual(a:string,b:string){const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);}
export function validAdminPassword(input:string){const expected=process.env.ADMIN_PASSWORD??"";return Boolean(expected)&&safeEqual(input,expected);}
export function createAdminSession(){const timestamp=Date.now().toString();return `${timestamp}.${sign(timestamp)}`;}
export async function isAdmin(){const value=(await cookies()).get(COOKIE_NAME)?.value;if(!value)return false;const [timestamp,signature]=value.split(".");if(!timestamp||!signature||!safeEqual(signature,sign(timestamp)))return false;const issued=Number(timestamp);return Number.isFinite(issued)&&Date.now()-issued<SESSION_MS;}
export const adminCookie={name:COOKIE_NAME,maxAge:Math.floor(SESSION_MS/1000)};
