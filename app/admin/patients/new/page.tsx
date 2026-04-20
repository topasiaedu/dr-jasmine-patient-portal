"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { ArrowLeft, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CreatedPatient {
  id: string;
  ghl_contact_id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export default function AdminNewPatientPage(): ReactElement {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [createdPatient, setCreatedPatient] = useState<CreatedPatient | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/patients", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name.trim(),
        phone: phone.trim(),
        email: email.trim().length > 0 ? email.trim() : undefined,
        readingCadenceNote: internalNote.trim().length > 0 ? internalNote.trim() : undefined,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      let msg = "Could not create patient.";
      try {
        const errBody: unknown = await res.json();
        if (
          typeof errBody === "object" &&
          errBody !== null &&
          "error" in errBody &&
          typeof (errBody as { error: unknown }).error === "string"
        ) {
          msg = (errBody as { error: string }).error;
        }
      } catch {
        /* ignore */
      }
      toast.error(msg);
      return;
    }
    const bodyUnknown: unknown = await res.json();
    const patient =
      typeof bodyUnknown === "object" &&
      bodyUnknown !== null &&
      "patient" in bodyUnknown
        ? (bodyUnknown as { patient: CreatedPatient }).patient
        : null;
    const url =
      typeof bodyUnknown === "object" &&
      bodyUnknown !== null &&
      "portalUrl" in bodyUnknown &&
      typeof (bodyUnknown as { portalUrl: unknown }).portalUrl === "string"
        ? (bodyUnknown as { portalUrl: string }).portalUrl
        : "";
    if (!patient) {
      toast.error("Unexpected response from server.");
      return;
    }
    setCreatedPatient(patient);
    setPortalUrl(url);
    setSubmitted(true);
    toast.success("Patient created.");
  };

  const handleCopy = (): void => {
    if (portalUrl.length === 0) {
      toast.error("No link to copy.");
      return;
    }
    void navigator.clipboard.writeText(portalUrl);
    toast.success("Copied to clipboard.");
  };

  if (!mounted) {
    return (
      <AdminLayout>
        <AdminPageSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/patients"
            className="p-2 border border-border bg-white rounded-xl hover:bg-gray-50 text-main transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-main">Add New Patient</h1>
            <p className="text-secondary text-sm">Creates a Supabase record and a GoHighLevel contact.</p>
          </div>
        </div>

        {!submitted ? (
          <form
            onSubmit={(ev) => void handleSubmit(ev)}
            className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5" htmlFor="np-name">
                  Full name <span className="text-danger">*</span>
                </label>
                <Input
                  id="np-name"
                  required
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-12 bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-main mb-1.5" htmlFor="np-phone">
                    Phone <span className="text-danger">*</span>
                  </label>
                  <Input
                    id="np-phone"
                    required
                    value={phone}
                    onChange={(ev) => setPhone(ev.target.value)}
                    placeholder="+60 12 345 6789"
                    className="h-12 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-main mb-1.5" htmlFor="np-email">
                    Email (optional)
                  </label>
                  <Input
                    id="np-email"
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder="john@example.com"
                    className="h-12 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-main mb-1.5" htmlFor="np-note">
                  Reading cadence note (staff only)
                </label>
                <textarea
                  id="np-note"
                  className="w-full border border-border bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                  value={internalNote}
                  onChange={(ev) => setInternalNote(ev.target.value)}
                  placeholder="Internal reminder for the care team — not shown to patients in Phase 1."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => router.push("/admin/patients")}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold px-6" disabled={saving}>
                {saving ? "Creating…" : "Create patient"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-2xl font-bold text-main mb-2">Patient created</h2>
            <p className="text-secondary max-w-md mx-auto mb-8">
              {createdPatient ? (
                <>
                  Profile for <strong className="text-main">{createdPatient.full_name}</strong> is ready. Share the
                  portal link when you are ready (GHL can also email it from your automation).
                </>
              ) : null}
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 w-full max-w-md mx-auto mb-8">
              <code className="text-sm font-semibold text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">
                {portalUrl.length > 0 ? portalUrl : "—"}
              </code>
              <Button type="button" onClick={handleCopy} size="icon" variant="outline" className="shrink-0 bg-white">
                <Copy size={18} className="text-main" />
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setName("");
                  setPhone("");
                  setEmail("");
                  setInternalNote("");
                  setPortalUrl("");
                  setCreatedPatient(null);
                }}
                className="rounded-xl h-11 font-semibold"
              >
                Add another
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/admin/patients")}
                className="bg-primary text-white rounded-xl h-11 font-semibold"
              >
                Back to directory
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
