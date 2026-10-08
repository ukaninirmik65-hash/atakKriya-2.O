import { useEffect, useState } from "react";
import AuthContext from "./AuthContext";

const isAuthenticatedUser = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return ["employeeId", "id", "email"].some((key) => {
    const identity = value[key];
    return (
      (typeof identity === "string" && identity.trim().length > 0) ||
      (typeof identity === "number" && Number.isFinite(identity))
    );
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    Promise.resolve().then(() => {
      try {
        const savedUser = localStorage.getItem("user");

        if (!savedUser) return;

        const parsedUser = JSON.parse(savedUser);

        if (!isAuthenticatedUser(parsedUser)) {
          throw new Error("Saved user data is invalid");
        }

        const restoredUser = Object.fromEntries(
          Object.entries(parsedUser).filter(
            ([key]) => key.toLowerCase() !== "password",
          ),
        );
        if (Object.keys(restoredUser).length !== Object.keys(parsedUser).length) {
          localStorage.setItem("user", JSON.stringify(restoredUser));
        }

        if (active) setUser(restoredUser);
      } catch (error) {
        if (active) setUser(null);
        try {
          localStorage.removeItem("user");
        } catch (storageError) {
          console.error(
            "Unable to clear invalid saved authentication data.",
            storageError,
          );
        }
        if (!(error instanceof SyntaxError) && error.message !== "Saved user data is invalid") {
          console.error("Unable to restore saved authentication data.", error);
        }
      } finally {
        if (active) setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const loggedInUser = {
      id: 1,
      email: credentials.email,
      name: "User",
    };

    if (!isAuthenticatedUser(loggedInUser)) {
      throw new Error("Login did not return a valid user.");
    }

    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  const logout = () => {
    try {
      localStorage.removeItem("user");
    } finally {
      setUser(null);
    }
  };

  const isAuthenticated = isAuthenticatedUser(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
