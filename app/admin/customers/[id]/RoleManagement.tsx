"use client";

import { useState } from "react";

import {
  updateCustomerRoleAction,
  type ManageableCustomerRole,
} from "../actions";

type Props = {
  customerId: string;
  currentRole: ManageableCustomerRole;
  canManageRole: boolean;
};

function roleLabel(
  role: ManageableCustomerRole,
) {
  switch (role) {
    case "super_admin":
      return "Admin Utama";

    case "admin":
      return "Admin 2";

    default:
      return "Customer";
  }
}

function roleDescription(
  role: ManageableCustomerRole,
) {
  switch (role) {
    case "super_admin":
      return "Full Admin access and Role Management.";

    case "admin":
      return "Admin workspace access without Role Management.";

    default:
      return "Customer account without Admin access.";
  }
}

export default function RoleManagement({
  customerId,
  currentRole,
  canManageRole,
}: Props) {
  const [role, setRole] =
    useState<ManageableCustomerRole>(
      currentRole,
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  if (!canManageRole) {
    return (
      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 lg:p-7">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
            Role & Access
          </p>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Role information for this account.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {roleLabel(currentRole)}
              </p>

              <p className="mt-1 text-xs leading-5 text-neutral-500">
                {roleDescription(currentRole)}
              </p>
            </div>

            <span className="inline-flex items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
              View Only
            </span>
          </div>
        </div>
      </section>
    );
  }

  async function handleSave() {
    if (role === currentRole) {
      setError(
        "No role changes to save.",
      );
      setMessage("");
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const result =
        await updateCustomerRoleAction(
          customerId,
          role,
        );

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update role.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 lg:p-7">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          Role Management
        </p>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
          Manage this account&apos;s Admin access and
          role permissions.
        </p>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label
            htmlFor="customer-role"
            className="text-[10px] uppercase tracking-[0.15em] text-neutral-400"
          >
            Account Role
          </label>

          <select
            id="customer-role"
            value={role}
            onChange={(event) =>
              setRole(
                event.target
                  .value as ManageableCustomerRole,
              )
            }
            disabled={isSaving}
            className="mt-2.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 disabled:cursor-not-allowed disabled:bg-stone-50 lg:max-w-md"
          >
            <option value="customer">
              Customer
            </option>

            <option value="admin">
              Admin 2
            </option>

            <option value="super_admin">
              Admin Utama
            </option>
          </select>

          <p className="mt-2 text-xs leading-5 text-neutral-400">
            {roleDescription(role)}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving ||
            role === currentRole
          }
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 px-5 text-xs font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-neutral-400 lg:w-auto"
        >
          {isSaving
            ? "Saving..."
            : "Save Role"}
        </button>
      </div>

      {message ? (
        <div className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-6 border-t border-stone-100 pt-5">
        <p className="text-xs leading-5 text-neutral-400">
          Only Admin Utama can change account roles.
          The final Admin Utama account cannot be
          demoted.
        </p>
      </div>
    </section>
  );
}