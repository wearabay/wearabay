"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ResetPasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const passwordsDoNotMatch =
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!password) {
      setMessage("Please enter your new password.");
      return;
    }

    if (password.length < 6) {
      setMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setMessage(
        "Please confirm your new password."
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Password updated successfully."
    );

    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 1500);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        required
      />

      {passwordsMatch && (
        <div
          className="
            rounded-lg
            bg-green-50
            px-4
            py-3
            text-sm
            text-green-700
          "
        >
          ✓ Passwords match
        </div>
      )}

      {passwordsDoNotMatch && (
        <div
          className="
            rounded-lg
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-700
          "
        >
          Passwords do not match
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={
          loading ||
          !passwordsMatch
        }
      >
        {loading
          ? "Updating..."
          : "Update Password"}
      </Button>

      {message && (
        <p className="text-sm text-neutral-600">
          {message}
        </p>
      )}
    </form>
  );
}