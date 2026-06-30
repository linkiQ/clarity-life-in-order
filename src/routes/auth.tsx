import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Clarity — Sign in" },
      { name: "description", content: "Sign in to sync Clarity across all your devices." },
    ],
  }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(8, "At least 8 characters").max(72);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const e1 = emailSchema.safeParse(email);
    const p1 = passwordSchema.safeParse(password);
    if (!e1.success) return toast.error(e1.error.issues[0].message);
    if (!p1.success) return toast.error(p1.error.issues[0].message);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: e1.data,
          password: p1.data,
          options: {
            data: { name: name.trim() || undefined },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Welcome to Clarity ✨");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: e1.data,
          password: p1.data,
        });
        if (error) throw error;
        toast.success("Welcome back");
      }
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function oauth(provider: "google" | "apple") {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message);
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 py-10 safe-top safe-bottom">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-2">
          <div className="size-9 rounded-2xl bg-primary/15 grid place-items-center">
            <Sparkles className="size-5 text-primary" />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">Clarity</span>
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Make it yours"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          {mode === "signin"
            ? "Sign in to sync your tasks across all your devices, securely."
            : "Create an account to back up and sync your tasks anywhere."}
        </p>

        <div className="mt-8 space-y-2.5">
          <button
            onClick={() => oauth("google")}
            disabled={loading}
            className="w-full h-12 rounded-2xl border border-border bg-surface-elevated hover:bg-secondary transition-colors flex items-center justify-center gap-3 font-medium disabled:opacity-50"
          >
            <GoogleIcon /> Continue with Google
          </button>
          <button
            onClick={() => oauth("apple")}
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity flex items-center justify-center gap-2.5 font-medium disabled:opacity-50"
          >
            <AppleIcon /> Continue with Apple
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">or email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={onEmailSubmit} className="space-y-3">
          {mode === "signup" && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              autoComplete="name"
              maxLength={80}
              className="w-full h-12 rounded-2xl bg-surface-elevated border border-border px-4 text-[15px] outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition"
            />
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className="w-full h-12 rounded-2xl bg-surface-elevated border border-border pl-11 pr-4 text-[15px] outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              required
              minLength={8}
              className="w-full h-12 rounded-2xl bg-surface-elevated border border-border pl-11 pr-4 text-[15px] outline-none focus:border-primary/60 focus:ring-4 focus:ring-primary/10 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-95 active:scale-[0.99] transition disabled:opacity-50"
          >
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>New here?{" "}
              <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">
                Create an account
              </button>
            </>
          ) : (
            <>Already have one?{" "}
              <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">
                Sign in
              </button>
            </>
          )}
        </p>
        <p className="mt-6 text-center text-[11px] text-muted-foreground/80 leading-relaxed">
          Your data is encrypted in transit and at rest. You can keep using Clarity without an account — your tasks stay on this device.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C41 35.9 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.47 2.27-1.22 3.09-.81.89-2.12 1.57-3.21 1.49-.13-1.11.43-2.27 1.17-3.05.83-.88 2.24-1.56 3.26-1.53zM20.6 17.27c-.55 1.26-.81 1.82-1.52 2.93-.99 1.55-2.4 3.48-4.13 3.5-1.54.02-1.93-1-4-1-2.06.02-2.49.99-4.04.99-1.74-.02-3.07-1.76-4.07-3.31C.74 16.36-.27 11.92.61 8.8c.62-2.2 2.6-4.13 4.84-4.13 1.99 0 3.24 1.09 4.89 1.09 1.6 0 2.58-1.09 4.88-1.09 1.71 0 3.53.93 4.83 2.55-4.24 2.32-3.55 8.4.55 9.96z"/>
    </svg>
  );
}
