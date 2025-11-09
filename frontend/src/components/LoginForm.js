import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { fetchProtectedData } from "../services/api";

export default function LoginForm({ className }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [protectedData, setProtectedData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const user = await login(email, password);

      setSuccess("Login successful!");
      console.log("Logged in user:", user);

      // Récupérer les données protégées
      const data = await fetchProtectedData();
      console.log("Protected data:", data);
      setProtectedData(data);

      // Redirection
      setTimeout(() => navigate("/expenses"), 1000);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed.");
    }
  };

  return (
    <div className={`flex flex-col gap-6 ${className || ""}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Login
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      {protectedData && (
        <div className="mt-4">
          <h2>Protected Data:</h2>
          <pre>{JSON.stringify(protectedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
