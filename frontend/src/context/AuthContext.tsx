import { createContext, useEffect, useState, type ReactNode } from "react";

type AuthUser = {
  id: string;
  username: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuthData: (user: AuthUser | null, token?: string | null) => void;
  clearAuthData: () => void;
};

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthData = (nextUser: AuthUser | null, token?: string | null) => {
    if (token) {
      localStorage.setItem("token", token);
    }

    setUser(nextUser);
    setIsAuthenticated(Boolean(nextUser));
  };

  const clearAuthData = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL?.trim() ?? "";

      if (!backendUrl) {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/auth/verify-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ token }),
        });

        const payload = (await response.json().catch(() => null)) as {
          loggedIn?: boolean;
          user?: AuthUser;
        } | null;

        if (!response.ok || !payload?.loggedIn || !payload.user) {
          clearAuthData();
          setIsLoading(false);
          return;
        }

        setUser(payload.user);
        setIsAuthenticated(true);
      } catch {
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setAuthData,
        clearAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
