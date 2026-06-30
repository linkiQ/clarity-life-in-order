import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { bindUser, useStore, resolveMigration } from "@/lib/store";

/** Mounts auth listener and binds user id to the store for cloud sync. */
export function AuthSync() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    void bindUser(user?.id ?? null);
  }, [user?.id, loading]);

  return <MigrationModal />;
}

function MigrationModal() {
  const pending = useStore((s) => s.migrationPending);
  const itemCount = useStore((s) => s.items.length);
  if (!pending) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-surface-elevated rounded-3xl p-6 shadow-2xl animate-sheet-up">
        <h2 className="font-display text-xl font-semibold tracking-tight">Bring your tasks with you?</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          You have <span className="font-semibold text-foreground">{itemCount}</span> {itemCount === 1 ? "item" : "items"} saved on this device.
          Move them into your account so they sync everywhere?
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => void resolveMigration(true)}
            className="h-12 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-95 active:scale-[0.99] transition"
          >
            Yes, keep my tasks
          </button>
          <button
            onClick={() => void resolveMigration(false)}
            className="h-12 rounded-2xl border border-border text-foreground hover:bg-secondary transition"
          >
            Start fresh
          </button>
        </div>
      </div>
    </div>
  );
}
