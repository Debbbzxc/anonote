export interface JwtPayload {
  userId: string;
  username: string;
  jti: string;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
