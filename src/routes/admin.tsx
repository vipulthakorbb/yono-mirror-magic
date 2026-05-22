import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStatus, claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "anon" }
    | { status: "no-admin"; userId: string }
    | { status: "ok"; userId: string }
    | { status: "forbidden" }
  >({ status: "loading" });
  const getStatus = useServerFn(getAdminStatus);
  const claim = useServerFn(claimFirstAdmin);

  const refresh = async () => {
    console.log("[admin] refresh start");
    const { data } = await supabase.auth.getSession();
    console.log("[admin] session", !!data.session);
    if (!data.session) {
      setState({ status: "anon" });
      return;
    }
    try {
      const s = await getStatus();
      console.log("[admin] status", s);
      if (s.isAdmin) setState({ status: "ok", userId: s.userId });
      else if (!s.anyAdminExists)
        setState({ status: "no-admin", userId: s.userId });
      else setState({ status: "forbidden" });
    } catch (e) {
      console.error("[admin] getStatus error", e);
      setState({ status: "anon" });
    }
  };

  useEffect(() => {
    console.log("[admin] mount effect");
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.status === "loading")
    return <div className="p-8 text-center">Loading admin…</div>;

  if (state.status === "anon") {
    return <LoginPanel onDone={refresh} />;
  }

  if (state.status === "no-admin") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border bg-white p-6 shadow">
        <h1 className="mb-2 text-xl font-bold">Become the first admin</h1>
        <p className="mb-4 text-sm text-gray-600">
          No admin exists yet. Claim this account as the site administrator.
        </p>
        <button
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          onClick={async () => {
            try {
              await claim();
              await refresh();
            } catch (e) {
              alert((e as Error).message);
            }
          }}
        >
          Claim admin role
        </button>
        <button
          className="mt-2 w-full text-sm text-gray-500 hover:underline"
          onClick={async () => {
            await supabase.auth.signOut();
            await refresh();
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  if (state.status === "forbidden") {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-xl border bg-white p-6 text-center shadow">
        <h1 className="text-xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-gray-600">
          Your account is not an admin.
        </p>
        <button
          className="mt-4 text-sm text-blue-600 hover:underline"
          onClick={async () => {
            await supabase.auth.signOut();
            await refresh();
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/admin" className="text-lg font-bold">
            RoyalYono Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-gray-600 hover:underline">
              View site
            </Link>
            <button
              className="text-gray-600 hover:underline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/admin" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}

function LoginPanel({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { error } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin + "/admin" },
            });
      if (error) throw error;
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl border bg-white p-6 shadow">
      <h1 className="mb-1 text-xl font-bold">
        {mode === "login" ? "Admin sign in" : "Create admin account"}
      </h1>
      <p className="mb-4 text-sm text-gray-500">
        {mode === "login"
          ? "Sign in to manage games."
          : "First account becomes the admin."}
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-md border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6)"
          className="w-full rounded-md border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
        </button>
      </form>
      <button
        className="mt-3 w-full text-sm text-gray-600 hover:underline"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </button>
    </div>
  );
}