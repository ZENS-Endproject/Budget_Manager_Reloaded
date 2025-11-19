import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import "../styles/theme.css";
import Text from "./Text";

import { API_URL } from "../lib/utils";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ e_mail: email, password: password }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Logged in user:", data.user);
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error.");
    }
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6 ", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              <Text variant="menuBlue">Login</Text>
            </CardTitle>
            <CardDescription>
              <Text variant="bodyBlack">
                Enter your email below to login to your account
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">
                    <Text variant="bodyBlue">Email</Text>
                  </Label>
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
                    <Label htmlFor="password">
                      <Text variant="bodyBlue">Password</Text>
                    </Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      <Text variant="bodyBlack">Forgot your password?</Text>
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
                {success && (
                  <div className="text-sm text-green-600">{success}</div>
                )}
                <div className="flex justify-center">
                  <Button type="submit" className="button  w-[100pt]">
                    <Text variant="bodyBlack">Login</Text>
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                <Text variant="bodyBlack">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="underline underline-offset-4">
                    {" "}
                    Sign up
                  </Link>
                </Text>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
