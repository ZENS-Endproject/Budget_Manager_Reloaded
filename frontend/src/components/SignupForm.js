import React, { useState } from "react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { API_URL } from "../lib/utils";
import Text from "./Text";

export function SignupForm() {
  const Navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    e_mail: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Signup failed");
      }

      const data = await response.json();
      setMessage(`Signup successful! Welcome, ${data.name}`);
      Navigate("/login");
      // Optional: store token if your backend sends it later
      // localStorage.setItem('token', data.token);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  return (
    <>
      <div className={cn("flex flex-col gap-6")}>
        <Card className="bg-[var(--bg-white)]">
          <CardHeader>
            <CardTitle className="text-2xl">
              <Text variant="menuBlue">Signup</Text>
            </CardTitle>
            <CardDescription>
              <Text variant="bodyBlack">Create your account</Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>
                    <Text variant="bodyBlue">Your Name</Text>
                  </Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    <Text variant="bodyBlue">Your Email</Text>
                  </Label>
                  <Input
                    type="email"
                    name="e_mail"
                    placeholder="Email"
                    value={form.e_mail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>
                    <Text variant="bodyBlue">Your Password</Text>
                  </Label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="flex justify-center">
                  <Button type="submit" className="button  w-[100pt]">
                    <Text variant="bodyBlack">Sign up</Text>
                  </Button>{" "}
                  <p>{message}</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
