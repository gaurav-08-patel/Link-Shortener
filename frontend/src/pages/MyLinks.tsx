import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../socket";

type LinkItem = {
  _id: string;
  url: string;
  shortUrl: string;
  clicks: number;
  createdAt?: string;
};

interface ClickUpdate {
  code: string;
  clicks: number;
}

const MyLinks = () => {
  const { user, isAuthenticated, clearAuthData } = useContext(AuthContext);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? "";

  const openLogoutToast = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    clearAuthData();
    setLogoutModalOpen(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  //listen for click updates from the server
  useEffect(() => {
    const handleClickUpdate = (update: ClickUpdate) => {
      setLinks((prevLinks) =>
        prevLinks.map((link) =>
          link.shortUrl.endsWith(update.code)
            ? { ...link, clicks: update.clicks }
            : link,
        ),
      );
    };

    // Subscribe to the "clickUpdate" event
    socket.on("clickUpdate", handleClickUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("clickUpdate");
    };
  }, []);

  useEffect(() => {
    const loadLinks = async () => {
      if (!user?.id || !isAuthenticated || !backendUrl) {
        setLoadingLinks(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/link/${user.id}`);
        const payload = (await response.json().catch(() => null)) as {
          links?: LinkItem[];
          message?: string;
        } | null;

        if (!response.ok) {
          toast.error(payload?.message || "Unable to load your links.");
          setLinks([]);
          return;
        }

        setLinks(payload?.links ?? []);
      } catch {
        toast.error("Unable to load your links.");
      } finally {
        setLoadingLinks(false);
      }
    };

    loadLinks();
  }, [backendUrl, isAuthenticated, user?.id]);

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
                My Links
              </h1>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={openLogoutToast}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Login
              </Link>
            )}
          </div>
        </header>

        {!isAuthenticated ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 shadow-[0_16px_50px_rgba(15,23,42,0.06)] backdrop-blur">
            Login to see and manage all your links and see clicks count.
          </div>
        ) : (
          <section className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-10">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
              Your links
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Manage everything in one place
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              View the original link, copied short URL, and click count for each
              saved item.
            </p>

            {loadingLinks ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                Loading your links...
              </div>
            ) : links.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                No links found yet. Create your first shortened link from the
                Home page.
              </div>
            ) : (
              <div className="mt-8 grid gap-4">
                {links.map((link) => (
                  <div
                    key={link._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-sm text-slate-950 break-all">
                      <span className="font-bold text-slate-900">
                        OriginalUrl :
                      </span>{" "}
                      {link.url}
                    </p>
                    <a
                      href={link.shortUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
                    >
                      {link.shortUrl}
                    </a>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                        Clicks: {link.clicks}
                      </span>
                      {link.createdAt ? (
                        <span>
                          Created{" "}
                          {new Date(link.createdAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default MyLinks;
