const React = require("react");
const { useState } = require("react");
const { cn } = require("../lib/utils");
const { Button } = require("./ui/button");
const {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} = require("./ui/card");
const { Label } = require("./ui/label");
const { Input } = require("./ui/input");
const { Link, useNavigate } = require("react-router-dom");

const { login } = require("../services/auth"); // <- Amplify login

function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const user = await login(email, password);

      // Récupérer le token JWT ID
      const token = user.signInUserSession.idToken.jwtToken;

      // Stocker token et email localement
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email: user.username }));

      setSuccess("Login successful!");
      console.log("Logged in user:", user);
      navigate("/expenses");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="m@example.com"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              {success && <div className="text-sm text-green-600">{success}</div>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

module.exports = { LoginForm };
