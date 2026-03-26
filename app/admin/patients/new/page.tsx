"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { ArrowLeft, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminNewPatientPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMounted(true);
    if (!localStorage.getItem("admin_auth")) {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://jasmine-portal.demo.net/p/demo");
    toast.success("Copied to clipboard!");
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
          <Link href="/admin/patients" className="p-2 border border-border bg-white rounded-xl hover:bg-gray-50 text-main transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-main">Add New Patient</h1>
            <p className="text-secondary text-sm">Create a profile and generate an intake link.</p>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Full Name <span className="text-danger">*</span></label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="h-12 bg-gray-50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-main mb-1.5">Phone Number <span className="text-danger">*</span></label>
                  <Input required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60 12 345 6789" className="h-12 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-main mb-1.5">Email (Optional)</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" className="h-12 bg-gray-50" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-main mb-1.5">Internal Note</label>
                <textarea 
                  className="w-full border border-border bg-gray-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={3}
                  placeholder="E.g. Referred by Dr. Lim"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => router.push("/admin/patients")}>
                Cancel
              </Button>
              <Button type="submit" className="h-12 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold px-6">
                Create & Generate Link
              </Button>
            </div>

          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-main mb-2">Patient Created Successfully!</h2>
            <p className="text-secondary max-w-sm mx-auto mb-8">
              A profile for <strong className="text-main">{name}</strong> has been created. Send them the link below to begin their onboarding.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3 w-full max-w-md mx-auto mb-8">
              <code className="text-sm font-semibold text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-1 text-left">
                https://jasmine-portal.demo.net/p/demo
              </code>
              <Button onClick={handleCopy} size="icon" variant="outline" className="shrink-0 bg-white">
                <Copy size={18} className="text-main" />
              </Button>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setSubmitted(false)} className="rounded-xl h-11 font-semibold">
                Add Another
              </Button>
              <Button onClick={() => router.push("/admin/patients")} className="bg-primary text-white rounded-xl h-11 font-semibold">
                Back to Directory
              </Button>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
