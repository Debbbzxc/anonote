const blacklist = new Map<string, number>();

function cleanup() {
  const now = Date.now();
  for (const [jti, exp] of blacklist) {
    if (exp <= now) blacklist.delete(jti);
  }
}

setInterval(cleanup, 60_000);

export const tokenBlacklist = {
  add(jti: string, exp: number) {
    blacklist.set(jti, exp * 1000);
  },
  has(jti: string) {
    return blacklist.has(jti);
  },
};
