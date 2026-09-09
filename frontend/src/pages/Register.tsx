import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const fieldBaseClasses =
  "mt-2 w-full rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-slate-200";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? "";

  const onSubmit = async (data: RegisterFormValues) => {
    if (!backendUrl) {
      toast.error("Backend URL is not configured.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        toast.error(payload?.message || "Registration failed. Please try again.");
        return;
      }

      reset();
      toast.success(
        payload?.message || "User registered successfully. You can log in now."
      );
    } catch (error) {
      console.log("Error during registration", error);  
      toast.error("Unable to reach the backend. Please try again.");
    }
  };

  const passwordValue = watch("password");

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
                Create your account with a clean, focused setup.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Register once and keep your links organized from a simple
                dashboard.
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mb-8">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
                Register
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in your details to get started.
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
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  aria-invalid={errors.username ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.username ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    maxLength: {
                      value: 30,
                      message: "Username must be at most 30 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                />
                {errors.username ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.username.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.email ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                />
                {errors.email ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.email.message}
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  aria-invalid={errors.password ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.password ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  className="text-sm font-medium text-slate-700"
                  htmlFor="confirmPassword"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                  className={`${fieldBaseClasses} ${errors.confirmPassword ? "border-rose-500 bg-rose-50 focus:ring-rose-100" : "border-slate-200 bg-white focus:border-slate-400"}`}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === passwordValue || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword ? (
                  <p className="mt-0.5 text-[11px] text-rose-600">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Create account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
