export default function ContactMini() {
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

      <div className="mb-4">
        <label className="block mb-1 text-[14px] text-[var(--text)]">
          Message
        </label>
        <textarea
          rows="4"
          placeholder="Type your message here..."
          className="w-full rounded-lg p-2"
        />
      </div>

      <button className="contact-btn">
        Send
      </button>
    </div>
  );
}
