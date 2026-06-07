import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    try {
      await register(username, password);
      navigate("/notes");
    } catch (err) {
      toast({ title: "Registration failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="items-center text-center space-y-4 pt-8 pb-0">
        <img src="/logo.png" alt="AnoNote" className="w-14 h-14 dark:invert" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AnoNote</h1>
          <p className="text-xs text-muted-foreground mt-1">Anonymous end-to-end encrypted notes</p>
        </div>
        <p className="text-xs text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
          Your password is your encryption key. If you lose it, your notes are unrecoverable.
        </p>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-0 pb-8">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
