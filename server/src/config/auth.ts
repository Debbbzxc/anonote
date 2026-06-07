const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error("FATAL: JWT_SECRET environment variable is not set");
  process.exit(1);
}
export const JWT_SECRET = secret;
