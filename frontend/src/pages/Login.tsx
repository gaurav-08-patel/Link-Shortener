import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type LoginFormValues = {
  usernameOrEmail: string;
  password: string;
};

const fieldBaseClasses =
  "mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-slate-200";

const Login = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? "";

  const onSubmit = async (data: LoginFormValues) => {
    if (!backendUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: data.usernameOrEmail,
          password: data.password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(payload?.message || "Login failed. Please try again.");
        return;
      }

      reset();
      toast.success(payload?.message || "Logged in successfully.");
    } catch (error) {
      console.log("Error during login", error);
      toast.error("Unable to reach the backend. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#e2e8f0_55%,_#cbd5e1)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden flex-col justify-between bg-slate-950 p-10 text-white md:flex">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
                Link Shortener
              </p>
              <h1 className="mt-6 max-w-sm text-4xl font-semibold leading-tight">
                Welcome back. Access your dashboard and links.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Sign in with your username or email and continue managing your
                short links.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
                Login
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Sign in to your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your username or email and password.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="usernameOrEmail"
                >
                  Username or email
                </label>
                <input
                  id="usernameOrEmail"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username or email"
                  aria-invalid={errors.usernameOrEmail ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.usernameOrEmail ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("usernameOrEmail", {
                    required: "Username or email is required",
                  })}
                />
                {errors.usernameOrEmail ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.usernameOrEmail.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.password ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("password", {
                    required: "Password is required",
                  })}
                />
                {errors.password ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-950 underline-offset-4 hover:underline"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
