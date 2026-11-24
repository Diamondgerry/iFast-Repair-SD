import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, LogOut, RefreshCw, Star, Trash2 } from "lucide-react";
import { Bolt } from "@/components/Logo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

const money = (v) => `$${((v || 0) / 100).toFixed(2)}`;
const dt = (v) =>
  v ? new Date(v).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export default function AdminPage() {
  const [user, setUser] = useState(undefined); // undefined = checking session, null = signed out
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("payments");
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const { data: d } = await axios.get(`${API}/admin/data`, { withCredentials: true });
      setData(d);
      return true;
    } catch (err) {
      if (err.response?.status === 401) {
        setUser(null);
        setData(null);
      }
      return false;
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then((r) => {
        setUser(r.data);
        loadData();
      })
      .catch(() => setUser(null));
  }, [loadData]);

  const onLogin = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const { data: u } = await axios.post(`${API}/auth/login`, creds, { withCredentials: true });
      setUser(u);
      await loadData();
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      /* cookie already cleared */
    }
    setUser(null);
    setData(null);
  };

  const deleteReview = async (id) => {
    try {
      await axios.delete(`${API}/admin/reviews/${id}`, { withCredentials: true });
      toast.success("Review deleted.");
      await loadData();
    } catch (err) {
      toast.error("Couldn't delete the review.");
    }
  };

  if (user === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ocean pt-20" data-testid="admin-checking">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">Checking session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-ocean px-5 pt-20" data-testid="admin-login-page">
        <form onSubmit={onLogin} data-testid="admin-login-form" className="w-full max-w-sm border border-white/10 bg-brand-black p-8">
          <span className="grid h-10 w-10 place-items-center bg-brand-yellow">
            <Bolt className="h-5 w-5" />
          </span>
          <h1 className="mt-6 font-display text-xl font-black uppercase tracking-tight text-white">Admin access</h1>
          <p className="mt-2 text-xs text-white/45">Private area — owner only.</p>
          <div className="mt-6">
            <label htmlFor="ad-email" className="field-label">Email</label>
            <input
              id="ad-email"
              data-testid="admin-login-email"
              className="field"
              type="email"
              value={creds.email}
              onChange={(e) => setCreds((c) => ({ ...c, email: e.target.value }))}
              placeholder="admin@email.com"
              required
            />
          </div>
          <div className="mt-4">
            <label htmlFor="ad-password" className="field-label">Password</label>
            <input
              id="ad-password"
              data-testid="admin-login-password"
              className="field"
              type="password"
              value={creds.password}
              onChange={(e) => setCreds((c) => ({ ...c, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p data-testid="admin-login-error" className="mt-4 border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            data-testid="admin-login-button"
            disabled={busy}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
            <Lock className="h-3 w-3" /> Owner access only
          </p>
        </form>
      </div>
    );
  }

  const TABS = [
    {
      id: "payments",
      label: "Payments",
      rows: data?.payments || [],
      cols: [
        { label: "Date", render: (r) => dt(r.created_at) },
        { label: "Type", render: (r) => (r.kind === "phone_deposit" ? "Deposit" : r.kind === "phone_full" ? "Phone purchase" : "Invoice") },
        { label: "Customer", render: (r) => `${r.name || "—"}${r.phone ? ` · ${r.phone}` : ""}` },
        { label: "For", render: (r) => r.device || r.purpose || "—" },
        { label: "Amount", render: (r) => money(r.amount) },
        { label: "Status", render: (r) => r.payment_status },
      ],
    },
    {
      id: "sell",
      label: "Sell quotes",
      rows: data?.sell_quotes || [],
      cols: [
        { label: "Date", render: (r) => dt(r.created_at) },
        { label: "Name", render: (r) => r.name || "—" },
        { label: "Phone", render: (r) => r.phone || "—" },
        { label: "Device", render: (r) => r.device || "—" },
        { label: "Condition", render: (r) => r.condition || "—" },
        { label: "Storage", render: (r) => r.storage || "—" },
      ],
    },
    {
      id: "buy",
      label: "Buy quotes",
      rows: data?.buy_quotes || [],
      cols: [
        { label: "Date", render: (r) => dt(r.created_at) },
        { label: "Name", render: (r) => r.name || "—" },
        { label: "Phone", render: (r) => r.phone || "—" },
        { label: "Device", render: (r) => r.device || "—" },
        { label: "Budget", render: (r) => r.budget || "—" },
      ],
    },
    {
      id: "bookings",
      label: "Bookings",
      rows: data?.appointments || [],
      cols: [
        { label: "Requested", render: (r) => dt(r.created_at) },
        { label: "Name", render: (r) => r.name || "—" },
        { label: "Phone", render: (r) => r.phone || "—" },
        { label: "Device", render: (r) => r.device || "—" },
        { label: "Service", render: (r) => r.service || "—" },
        { label: "When", render: (r) => `${r.date || ""} · ${r.time || ""}` },
        { label: "Status", render: (r) => r.status },
      ],
    },
    {
      id: "reviews",
      label: "Reviews",
      rows: data?.reviews || [],
      cols: [
        { label: "Date", render: (r) => dt(r.created_at) },
        { label: "Name", render: (r) => r.name || "—" },
        { label: "Rating", render: (r) => `${r.rating}/5` },
        { label: "Review", render: (r) => r.text },
        { label: "Device", render: (r) => r.device || "—" },
        {
          label: "",
          render: (r) => (
            <button
              type="button"
              onClick={() => deleteReview(r.id)}
              data-testid={`admin-delete-review-${r.id}`}
              className="inline-flex items-center gap-1 text-red-400 transition-colors hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ),
        },
      ],
    },
  ];
  const active = TABS.find((t) => t.id === tab) || TABS[0];

  return (
    <div className="min-h-screen bg-brand-ocean pb-24 pt-28" data-testid="admin-dashboard">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Private dashboard</p>
            <h1 className="mt-4 font-display text-2xl font-black uppercase tracking-tight text-white md:text-4xl">
              Everything, <span className="text-brand-yellow">at a glance.</span>
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadData()}
              data-testid="admin-refresh-button"
              className="btn-ghost !px-4 !py-2.5"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button
              type="button"
              onClick={logout}
              data-testid="admin-logout-button"
              className="btn-ghost !px-4 !py-2.5"
            >
              <LogOut className="h-4 w-4" /> Log out
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" data-testid="admin-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              data-testid={`admin-tab-${t.id}`}
              className={`border px-4 py-2.5 font-sans text-xs font-extrabold uppercase tracking-[0.15em] transition-colors ${
                tab === t.id
                  ? "border-brand-yellow bg-brand-yellow text-black"
                  : "border-white/15 text-white/60 hover:border-brand-yellow/50 hover:text-brand-yellow"
              }`}
            >
              {t.label}
              <span className={`ml-2 font-mono text-[10px] ${tab === t.id ? "text-black/60" : "text-white/35"}`}>
                {t.rows.length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {active.rows.length === 0 ? (
            <div
              className="border border-white/10 bg-brand-surface p-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/40"
              data-testid="admin-table-empty"
            >
              Nothing here yet.
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/10">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="bg-brand-surface">
                    {active.cols.map((c) => (
                      <th
                        key={c.label}
                        className="px-4 py-3 font-sans text-[10px] font-extrabold uppercase tracking-[0.15em] text-brand-yellow"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {active.rows.map((row, i) => (
                    <tr key={row.id || row.session_id || i} className="border-t border-white/5 odd:bg-brand-black even:bg-brand-surface/40">
                      {active.cols.map((c) => (
                        <td key={c.label} className="max-w-[260px] px-4 py-3 align-top font-mono text-[11px] leading-relaxed text-white/70">
                          {c.render(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
