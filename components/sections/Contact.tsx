"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { usePortfolio } from "@/context/PortfolioContext";
import { useLanguage } from "@/context/LanguageContext";
import { FadeInSection } from "@/components/ui/FadeInSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const { profile } = usePortfolio();
  const { t } = useLanguage();

  const [form, setForm] = useState({ name: "", email: "", message: "", honeypot: "" });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const mountedAt = useState(() => Date.now())[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: form.message,
          honeypot: form.honeypot,
          elapsed: Date.now() - mountedAt,
        }),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "", honeypot: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
      setTimeout(() => setStatus("idle"), 6000);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="section-container">
        <FadeInSection>
          <h2 className="section-title text-center">{t('contact.title')}</h2>
          <p className="section-subtitle text-center">{t('contact.subtitle')}</p>
        </FadeInSection>

        <div className="max-w-4xl mx-auto">
          {/* Liens de contact */}
          <FadeInSection delay={0.1}>
            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              {/* Email */}
              <Link href={`mailto:${profile.email}`} className="card text-center group" aria-label={`Envoyer un email à ${profile.email}`}>
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">{t('contact.email')}</h3>
                <p className="text-gray-400 text-sm break-all">{profile.email}</p>
              </Link>

              {/* GitHub */}
              <Link href={profile.github} target="_blank" rel="noopener noreferrer" className="card text-center group" aria-label="GitHub — ouvrir le profil dans un nouvel onglet">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <svg className="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">GitHub</h3>
                <p className="text-gray-400 text-sm">{t('contact.github')}</p>
              </Link>

              {/* LinkedIn */}
              <Link href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="card text-center group" aria-label="LinkedIn — ouvrir le profil dans un nouvel onglet">
                <div className="w-12 h-12 mx-auto mb-4 bg-primary-500/20 rounded-full flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                  <svg className="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                <h3 className="text-white font-medium mb-2">LinkedIn</h3>
                <p className="text-gray-400 text-sm">{t('contact.linkedin')}</p>
              </Link>
            </div>
          </FadeInSection>

          {/* Formulaire de contact */}
          <FadeInSection delay={0.2}>
            <div className="bg-dark-800 rounded-2xl border border-dark-700 p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-white mb-6">{t('contact.form.title')}</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot anti-spam */}
                <div aria-hidden="true" className="honeypot-field">
                  <label htmlFor="contact-website">Website</label>
                  <input
                    id="contact-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.honeypot}
                    onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name" className="text-gray-300">
                      {t('contact.form.name')}
                    </Label>
                    <Input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('contact.form.namePlaceholder')}
                      className="bg-dark-900 border-dark-600 text-white placeholder:text-gray-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-gray-300">
                      {t('contact.form.email')}
                    </Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder={t('contact.form.emailPlaceholder')}
                      className="bg-dark-900 border-dark-600 text-white placeholder:text-gray-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message" className="text-gray-300">
                    {t('contact.form.message')}
                  </Label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t('contact.form.messagePlaceholder')}
                    className="bg-dark-900 border-dark-600 text-white placeholder:text-gray-500 focus:border-primary-500 resize-none"
                  />
                </div>

                {/* Bouton avec spinner */}
                <button
                  type="submit"
                  disabled={sending}
                  className={clsx(
                    "w-full btn-primary justify-center transition-opacity",
                    sending && "opacity-70 cursor-not-allowed"
                  )}
                >
                  {sending ? (
                    <>
                      {/* Spinner animé */}
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {t('contact.form.sending')}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      {t('contact.form.send')}
                    </>
                  )}
                </button>

                {/* Messages traduits — aria-live pour les lecteurs d'écran */}
                <div aria-live="polite" aria-atomic="true">
                  {status === "success" && (
                    <p className="text-center text-sm text-green-400 font-medium">
                      {t('contact.form.success')}
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-center text-sm text-red-400 font-medium">
                      {t('contact.form.error')}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}
