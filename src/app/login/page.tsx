"use client";

import React, { useState, Suspense } from "react";
import { Shield, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("from") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Success, redirect
      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-white text-black selection:bg-black selection:text-white">
      {/* Left Column - Branding */}
      <div className="hidden md:flex md:w-1/2 flex-col justify-between p-12 lg:p-24 border-r border-zinc-200 bg-zinc-50/50 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-100/50 to-transparent pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3 relative z-10"
        >
          <Shield className="w-8 h-8 text-black" strokeWidth={1.5} />
          <span className="font-heading text-2xl font-semibold tracking-tight">
            GovIntel OS
          </span>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="max-w-md relative z-10"
        >
          <motion.h1 variants={fadeUp} className="text-4xl lg:text-5xl font-heading leading-tight mb-6 tracking-tight">
            Institutional intelligence for governance, policy, and research.
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-500 font-serif text-lg leading-relaxed">
            Secure, localized processing. Enterprise-grade retrieval.
            Designed for the strict operational requirements of modern
            government infrastructure.
          </motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="flex items-center justify-between text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase relative z-10"
        >
          <span>Secure Subsystem</span>
          <span>Version 2.0.4</span>
        </motion.div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-24 py-12 relative">
        <div className="md:hidden flex items-center gap-3 mb-16">
          <Shield className="w-6 h-6 text-black" strokeWidth={1.5} />
          <span className="font-heading text-xl font-semibold tracking-tight">
            GovIntel OS
          </span>
        </div>

        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="max-w-md w-full mx-auto md:mx-0"
        >
          <motion.div variants={fadeUp} className="mb-10">
            <h2 className="text-3xl font-heading mb-3 tracking-tight">Access Workspace</h2>
            <p className="text-zinc-500 text-sm font-serif leading-relaxed">
              Enter your credentials to continue to your secure intelligence workspace.
              New users will be automatically registered.
            </p>
          </motion.div>

          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium mb-4"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5 group">
                <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase transition-colors group-focus-within:text-black">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all hover:bg-white"
                  placeholder="e.g. Sanket Gangani"
                />
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase transition-colors group-focus-within:text-black">
                  Institutional Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all hover:bg-white"
                  placeholder="analyst@gov.org"
                />
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase transition-colors group-focus-within:text-black">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all hover:bg-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-1.5 group">
                <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase transition-colors group-focus-within:text-black">
                  Department / Workspace
                </label>
                <input
                  name="department"
                  type="text"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all hover:bg-white"
                  placeholder="e.g. Policy Research"
                />
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "relative w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-4 text-sm font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden"
                )}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <div className="relative flex items-center gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </div>
            
            <p className="text-center text-xs text-zinc-400 mt-8 font-serif leading-relaxed">
              By authenticating, you agree to the strict confidentiality terms of GovIntel OS.
            </p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
