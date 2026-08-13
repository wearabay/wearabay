"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email address.");
      return;
    }

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password`,
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Password reset link has been sent to your email."
      );
    }

    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
        required
      />

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading
          ? "Sending..."
          : "Send Reset Link"}
      </Button>

      {message && (
        <p className="text-sm text-neutral-600">
          {message}
        </p>
      )}
    </form>
  );
}