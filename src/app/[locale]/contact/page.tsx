"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Linkedin, Github, Twitter, MessageSquare, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/PublicLayout";

export default function ContactPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setSent(true);
      setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      label: t("contact.emailLabel"),
      value: "contact@knowbest.ro",
      href: "mailto:contact@knowbest.ro",
    },
    {
      icon: Phone,
      label: t("contact.phoneLabel"),
      value: "+40 749 591 399",
      href: "tel:+40749591399",
    },
    {
      icon: MapPin,
      label: t("contact.locationLabel"),
      value: t("contact.locationValue"),
      href: null,
    },
    {
      icon: Building2,
      label: t("contact.companyLabel"),
      value: t("contact.companyValue"),
      href: null,
    },
  ];

  // Social profiles disabled until real KnowBest accounts exist.
  // To re-activate: set enabled:true + the correct href per platform.
  const socialLinks = [
    { icon: Github, href: "https://github.com/knowbest", label: "GitHub", enabled: false },
    { icon: Linkedin, href: "https://linkedin.com/company/knowbest", label: "LinkedIn", enabled: false },
    { icon: Twitter, href: "https://twitter.com/knowbest", label: "Twitter", enabled: false },
  ].filter((s) => s.enabled);

  return (
    <div>
      <PublicLayout>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">
                <MessageSquare className="w-4 h-4" />
                {t("contact.badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
            >
              {t("contact.heroTitle")}{" "}
              <span className="kb-gradient-text">{t("contact.heroHighlight")}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto"
            >
              {t("contact.heroDescription")}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("contact.infoTitle")}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6" />
              <p className="text-slate-400 mb-8">{t("contact.infoDescription")}</p>

              <div className="space-y-5 mb-8">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-indigo-400/30 hover:bg-white/[0.05] transition-all duration-200"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex-shrink-0 shadow-lg shadow-indigo-500/25">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-white font-medium hover:text-indigo-300 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white font-medium">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {socialLinks.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-indigo-300/90 uppercase tracking-[0.25em] mb-4">
                    {t("contact.followUs")}
                  </h3>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.06] text-slate-400 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 hover:text-white transition-all duration-200"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form - Glass effect */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl">
                {/* Subtle gradient glow behind form */}
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 rounded-2xl blur-xl -z-10" />

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mb-6">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {t("contact.successTitle")}
                    </h3>
                    <p className="text-slate-400 mb-6">{t("contact.successMessage")}</p>
                    <Button variant="outline" onClick={() => setSent(false)} className="rounded-full border-indigo-400/40 bg-transparent text-indigo-200 hover:border-indigo-300 hover:bg-indigo-500/10 hover:text-white">
                      {t("contact.sendAnother")}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">{t("contact.form.name")} *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t("contact.form.namePlaceholder")}
                          className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">{t("contact.form.email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t("contact.form.emailPlaceholder")}
                          className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-300">{t("contact.form.company")}</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder={t("contact.form.companyPlaceholder")}
                          className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-300">{t("contact.form.subject")} *</Label>
                        <Input
                          id="subject"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={t("contact.form.subjectPlaceholder")}
                          className="h-11 border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-300">{t("contact.form.message")} *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.form.messagePlaceholder")}
                        className="border-white/10 bg-white/[0.04] text-white placeholder:text-slate-500 focus-visible:border-indigo-400/60 focus-visible:ring-indigo-400/20"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-500/10 border border-red-400/30 p-3 text-sm text-red-300">
                        {error}
                      </div>
                    )}

                    <Button type="submit" size="lg" className="w-full gap-2 h-12 text-base rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30 hover:from-blue-400 hover:to-purple-400" disabled={sending}>
                      {sending ? (
                        <>{t("contact.form.sending")}</>
                      ) : (
                        <>
                          {t("contact.form.send")}
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      </PublicLayout>
    </div>
  );
}
