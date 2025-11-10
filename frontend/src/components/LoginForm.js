import React from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function LoginForm({ className, ...props }) {
  const handleCognitoLogin = () => {
    // Redirection vers le backend pour login Cognito
    window.location.href = "http://localhost:5005/login";
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