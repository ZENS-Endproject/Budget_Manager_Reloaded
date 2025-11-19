import React, { useState, useEffect } from "react";
export default function ContactMini() {
  const user = JSON.parse(localStorage.getItem("user"));
  const user_email = user?.e_mail;
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState({ loading: false, ok: null, error: "" });

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
      setState({ loading: false, ok: false, error: "Failed to send" });
      console.error("Contact form error:", err);
    }
  }

  return (
    <div
      className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7"
    >
      <h2 className="text-[18px] font-semibold mb-3 text-[var(--text)]">
        Contact us
      </h2>

      <div className="mb-4">
        <label className="block mb-1 text-[14px] text-[var(--text)]">
          Subject
        </label>
        <input
          type="text"
          placeholder="What’s your message about?"
          className="w-full rounded-lg p-2"
        />
      </div>

      <label className="block text-sm mb-1">Message</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full mb-4 rounded-lg p-2"
        placeholder="Type your message here..."
      />
      <div className="flex items-center gap-3">
        {state.ok && (
          <span className="text-sm text-green-700">Thank you! ✉️</span>
        )}
        {state.ok === false && (
          <span className="text-sm text-red-700">{state.error}</span>
        )}
      </div>

      <button className="contact-btn">
        Send
      </button>
    </div>
  );
}
