import { useState } from "react";
import { useNavigate } from "react-router";
import useAuth from "../../hook/useAuth";
import useToast from "../../hook/useToast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await login(formData);
      if (response.success) {
        showToast("Login successful", { type: "success" });
        navigate("/dashboard");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "mb-1 block text-xs font-medium uppercase text-slate-400";
  const inputClass =
    "h-11 w-full rounded-xl border border-slate-800 bg-white px-4 text-sm text-slate-800 " +
    "placeholder:text-slate-500 outline-none transition " +
    "focus:border-blue-700 focus:ring-2 focus:ring-blue-200";

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-sm sm:p-6">
          <div className="mb-6 flex justify-center">
            <img
              src="/AK_Full_logo.png"
              alt="Atal Karya"
              className="h-14 max-w-full object-contain"
            />
          </div>

          <h1 className="mb-6 text-3xl font-bold text-blue-800">Login</h1>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Email"
                autoComplete="email"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Password"
                autoComplete="current-password"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full cursor-pointer rounded-xl bg-blue-800 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      <footer className="pb-6 text-center text-xs text-slate-500">
        Handcreafted by-Shivvilon-Solutions.© {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Login;
