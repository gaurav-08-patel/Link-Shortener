import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

type ShortenFormValues = {
  originalUrl: string;
};

const fieldBaseClasses =
  "mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-slate-200";

const Home = () => {
  const { user, isAuthenticated, isLoading, clearAuthData } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const [shortUrl, setShortUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShortenFormValues>({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? "";
  const avatarLabel = useMemo(
    () => (user?.username ? user.username.slice(0, 1).toUpperCase() : "U"),
    [user?.username],
  );

  const openLogoutToast = () => {
    setMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearAuthData();
    setLogoutModalOpen(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const onSubmit = async (data: ShortenFormValues) => {
    if (!backendUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/link/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: data.originalUrl,
          userId: user?.id ?? undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        shortUrl?: string;
      } | null;

      if (!response.ok) {
        toast.error(payload?.message || "Unable to shorten link.");
        return;
      }

      if (payload?.shortUrl) {
        setShortUrl(payload.shortUrl);
      }

      reset();
      toast.success("Link shortened successfully.");
    } catch (error) {
      console.log("Error shortening link", error);
      toast.error("Unable to reach the backend. Please try again.");
    }
  };

  const copyShortUrl = async () => {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short URL copied to clipboard.");
    } catch {
      toast.error("Unable to copy the link.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_55%,_#cbd5e1)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      {logoutModalOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-[2px] animate-[modalFade_0.22s_ease-out_forwards]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          onClick={() => setLogoutModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_30px_90px_rgba(15,23,42,0.35)] animate-[modalZoom_0.22s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            onClick={(event) => event.stopPropagation()}
          >
            <p
              id="logout-dialog-title"
              className="text-sm font-semibold text-slate-950"
            >
              Log out?
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Are you sure you want to log out from your account?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutModalOpen(false)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-lg shadow-slate-950/20">
              LS
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-slate-500">
                Link Shortener
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-950">
                Link Shortener
              </h1>
            </div>
          </Link>

          <div ref={menuRef} className="relative">
            {isLoading ? null : isAuthenticated && user ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen((value) => !value)}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-950 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:scale-105"
                  aria-label="Open user menu"
                >
                  {avatarLabel}
                </button>

                {menuOpen ? (
                  <div className="absolute right-0 top-14 z-20 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-slate-950">
                        {user.username}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                    <Link
                      to="/my-links"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                    >
                      MyLinks
                    </Link>
                    <button
                      type="button"
                      onClick={openLogoutToast}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {!isAuthenticated ? (
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur">
            Login to see and manage all your links and see clicks count.
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
              Shorten
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Turn long links into something clean.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Paste an original URL below and generate a short shareable link.
              If you are signed in, it will be stored with your account so you
              can track it later.
            </p>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="originalUrl"
                >
                  Original link
                </label>
                <input
                  id="originalUrl"
                  type="url"
                  placeholder="https://example.com/your-long-link"
                  autoComplete="off"
                  aria-invalid={errors.originalUrl ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.originalUrl ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("originalUrl", {
                    required: "Original link is required",
                    pattern: {
                      value:
                        /^(https?:\/\/)[\w.-]+(?:\.[\w\.-]+)+(?:[\/?#][^\s]*)?$/i,
                      message:
                        "Enter a valid URL starting with http:// or https://",
                    },
                  })}
                />
                {errors.originalUrl ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.originalUrl.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Shorten link
              </button>
            </form>

            {shortUrl ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Your shortened URL
                </p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={shortUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-sm font-medium text-slate-950 underline-offset-4 hover:underline"
                  >
                    {shortUrl}
                  </a>
                  <button
                    type="button"
                    onClick={copyShortUrl}
                    className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-3xl border border-white/70 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:p-10">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
              Why use it
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              Fast, simple, and account-aware.
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Keep your links organized, see click counts, and revisit them
              anytime from your MyLinks page.
            </p>

            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Save links under your account when you are signed in.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Review and manage all of your links from one place.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Track how many times each link has been opened.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default Home;
