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

  const socialLinks = [
    { icon: Github, href: "https://github.com/knowbest", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/knowbest", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/knowbest", label: "Twitter" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PublicLayout>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t("contact.badge")}
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6"
            >
              {t("contact.heroTitle")}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("contact.heroHighlight")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
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
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {t("contact.infoTitle")}
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6" />
              <p className="text-slate-600 mb-8">{t("contact.infoDescription")}</p>

              <div className="space-y-5 mb-8">
                {contactInfo.map((info, i) => (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white flex-shrink-0 shadow-lg shadow-blue-600/15">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-slate-900 font-medium hover:text-blue-600 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-slate-900 font-medium">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  {t("contact.followUs")}
                </h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 hover:text-white transition-all duration-200"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Form - Glass effect */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 p-8 shadow-xl shadow-slate-200/50">
                {/* Subtle gradient glow behind form */}
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-100/50 via-transparent to-purple-100/50 rounded-2xl blur-xl -z-10" />

                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {t("contact.successTitle")}
                    </h3>
                    <p className="text-slate-600 mb-6">{t("contact.successMessage")}</p>
                    <Button variant="outline" onClick={() => setSent(false)}>
                      {t("contact.sendAnother")}
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700">{t("contact.form.name")} *</Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={t("contact.form.namePlaceholder")}
                          className="bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700">{t("contact.form.email")} *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={t("contact.form.emailPlaceholder")}
                          className="bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-slate-700">{t("contact.form.company")}</Label>
                        <Input
                          id="company"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder={t("contact.form.companyPlaceholder")}
                          className="bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-slate-700">{t("contact.form.subject")} *</Label>
                        <Input
                          id="subject"
                          required
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          placeholder={t("contact.form.subjectPlaceholder")}
                          className="bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-700">{t("contact.form.message")} *</Label>
                      <Textarea
                        id="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.form.messagePlaceholder")}
                        className="bg-white/50 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    <Button type="submit" size="lg" className="w-full gap-2 h-12 text-base shadow-lg shadow-blue-600/20" disabled={sending}>
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
