import { createContext, useContext, useState, useEffect } from "react";
import API from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("jt_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      API.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data.success) setUser(res.data.user);
          else {
            setToken(null);
            localStorage.removeItem("jt_token");
          }
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("jt_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    if (res.data.success) {
      localStorage.setItem("jt_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (name, email, password, role, referralCode) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
      role,
      referralCode,
    });
    if (res.data.success) {
      localStorage.setItem("jt_token", res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("jt_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: user?.role === "admin",
        isShopkeeper: user?.role === "shopkeeper",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
