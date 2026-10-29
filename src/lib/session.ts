import { unsealData } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  id: number;
  email: string;
}

export async function getSession(): Promise<SessionData | undefined> {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return undefined;
  try {
    return await unsealData<SessionData>(cookie, {
      password: process.env.IRON_SESSION_PASSWORD!,
    });
  } catch {
    // Cookie malformado/expirado/assinado com senha antiga.
    return undefined;
  }
}
