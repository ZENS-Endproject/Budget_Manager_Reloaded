import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";
export default function ContactMini() {
  const user = JSON.parse(localStorage.getItem("user"));
  const user_email = user?.e_mail;
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState({ loading: false, ok: null, error: "" });
  const { t } = useTranslation();
  async function onSubmit(e) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setState({ loading: true, ok: null, error: "" });

    try {
      const base = process.env.REACT_APP_API_BASE || "";
      const res = await fetch(`${base}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email, subject, message }),
      });


      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Unknown error");
      }


      setState({ loading: false, ok: true, error: "" });
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error("Contact error:", err);
      console.error("Contact error:", err);
      setState({ loading: false, ok: false, error: "Failed to send" });
    }
  }

  return (
    <div className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7">
    <div className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7">
      <h2 className="text-[18px] font-semibold mb-3 text-[var(--text)]">
        {t("contactUs")}
      </h2>

      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block mb-1 text-[14px] text-[var(--text)]">
            {t("subject")}
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            type="text"
            placeholder={t("whatIsYourMessageAbout")}
          />
        </div>

        <label className="block text-sm mb-1 text-[var(--text)]">
          {t("message")}
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={t("typeYourMessageHere")}
          className="mb-3"
        />

        <div className="flex items-center gap-3 mt-3">
          <button
            type="submit"
            disabled={state.loading || !subject.trim() || !message.trim()}
            className="contact-btn"
          >
            {state.loading ? t("sending") : t("send")}
          </button>

          {state.ok && (
            <span className="text-sm text-green-700">{t("thankYou")} ✉️</span>
          )}
          {state.ok === false && (
            <span className="text-sm text-red-700">{state.error}</span>
          )}
        </div>
      </form>
    </div>
  );
}
