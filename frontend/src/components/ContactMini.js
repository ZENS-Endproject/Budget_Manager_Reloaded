import React, { useState } from "react";

export default function ContactMini() {
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
        body: JSON.stringify({ subject, message }),
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
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 p-6 md:p-7 text-[#0A4A56]"
    >
      <h3 className="text-[16px] font-semibold mb-4">Contact us</h3>

      <label className="block text-sm mb-1">Subject</label>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full mb-3 rounded-xl border border-[#D8E4E8] bg-white/90 px-3 py-2 outline-none focus:ring-2 focus:ring-[#0489A9]/30"
        placeholder="What’s your message about?"
      />

      <label className="block text-sm mb-1">Message</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full mb-4 rounded-xl border border-[#D8E4E8] bg-white/90 px-3 py-2 outline-none resize-y focus:ring-2 focus:ring-[#0489A9]/30"
        placeholder="Type your message here..."
      />

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state.loading || !subject.trim() || !message.trim()}
          className="rounded-full bg-[#0489A9] px-4 py-2 text-white disabled:opacity-50 hover:brightness-105 transition"
        >
          {state.loading ? "Sending..." : "Send"}
        </button>
        {state.ok && (
          <span className="text-sm text-green-700">Thank you! ✉️</span>
        )}
        {state.ok === false && (
          <span className="text-sm text-red-700">{state.error}</span>
        )}
      </div>
    </form>
  );
}
