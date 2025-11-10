// src/pages/Login.jsx
import React from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

export function LoginForm({ className, ...props }) {
  const handleCognitoLogin = () => {
    window.location.href = "http://localhost:5005/login"; // backend Cognito login
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Click below to login using your Amazon Cognito account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Button type="button" className="w-full" onClick={handleCognitoLogin}>
              Login with Amazon Cognito
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LogoutButton() {
  const handleLogout = () => {
    window.location.href = "http://localhost:5005/logout"; // backend logout
  };

  return (
    <Button
      type="button"
      className="w-full bg-red-600 hover:bg-red-700 text-white"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome</h1>
        <LoginForm />
      </div>
    </div>
  );
}