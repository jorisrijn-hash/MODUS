import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { isRateLimited, recordLoginAttempt } from "@/lib/auth/rateLimit";
import { getClientIp } from "@/lib/auth/getClientIp";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (await isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const { username, password } = parsed.data;
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminHashB64 = process.env.ADMIN_PASSWORD_HASH_B64;

  if (!adminUsername || !adminHashB64) {
    return NextResponse.json({ error: "Admin access is not configured." }, { status: 500 });
  }
  const adminHash = Buffer.from(adminHashB64, "base64").toString("utf8");

  // Constant-shape check: always verify a password hash even on username
  // mismatch, so response timing doesn't reveal whether the username exists.
  const usernameMatches = username === adminUsername;
  const passwordMatches = await verifyPassword(adminHash, password);
  const success = usernameMatches && passwordMatches;

  await recordLoginAttempt(ip, success);

  if (!success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const session = await getSession();
  session.username = username;
  session.loggedInAt = Date.now();
  await session.save();

  return NextResponse.json({ ok: true });
}
