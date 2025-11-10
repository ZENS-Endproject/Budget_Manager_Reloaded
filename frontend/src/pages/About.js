import React from "react";
import ContactMini from "../components/ContactMini";

const team = [
  { name: "Zsuzsanna Farkas", role: "Frontend", traits: ["trait", "trait"] },
  { name: "Emma C. S. Feck", role: "Frontend", traits: ["trait", "trait"] },
  { name: "Nassima Amroun", role: "Backend", traits: ["trait", "trait"] },
  { name: "Senda Zidi", role: "Backend", traits: ["trait", "trait"] },
];

export default function About() {
  const gutter =
    (typeof window !== "undefined" &&
      parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--page-gutter")
          .trim() || "24",
        10
      )) ||
    24;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "#FEFEEF", color: "#0A4A56" }}
    >
      <section className="pt-6 pb-12">
        <div
          className="grid gap-6 px-6"
          style={{
            paddingLeft: `calc(var(--sidebar-width, 0px) + ${gutter}px)`,
            gridTemplateColumns: "minmax(0,1fr) 360px", // linke flexible, rechte fixe Spalte
          }}
        >
          {/* Zeile 1 – links: What is ZENS? */}
          <article className="col-start-1 row-start-1 rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 p-6 md:p-7">
            <h2 className="text-[18px] font-semibold mb-3">What is ZENS?</h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[#0A4A56]/90">
              <p>
                Take control of your money — with the Budget App! It helps you
                track income and expenses and instantly see where your money
                goes.
              </p>
              <p>
                Add one-off or recurring entries, filter & categorize, and
                explore clear charts. Everything stays neatly organized in one
                place, and you can export your data (e.g. PDF/CSV) anytime.
              </p>
              <p>
                Modern, clean, and easy to use — built with React &amp; Node.js.
              </p>
            </div>
          </article>

          {/* Zeile 1 – rechts: Impressum */}
          <aside className="col-start-2 row-start-1 rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 p-6 md:p-7 h-fit">
            <h2 className="text-[18px] font-semibold mb-3">Impressum</h2>
            <div className="space-y-4 text-[13px] text-[#0A4A56]/90">
              <div>
                <div className="font-semibold">Unternehmen</div>
                <div>Dein Firmenname</div>
                <div>Straße 1</div>
                <div>12345 Musterstadt</div>
              </div>
              <div>
                <div className="font-semibold">Kontakt</div>
                <div>E-Mail: hello@zens.app</div>
                <div>Telefon: +49 …</div>
              </div>
              <div>
                <div className="font-semibold">Hinweise</div>
                <div>USt-ID, Registergericht, Vertretungsberechtigte …</div>
              </div>
            </div>
          </aside>

          {/* Zeile 2 – links: Team */}
          <article className="col-start-1 row-start-2 rounded-2xl bg-white/70 shadow-sm ring-1 ring-black/5 p-6 md:p-7">
            <h2 className="text-[18px] font-semibold mb-5">This is our Team</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {team.map((m) => (
                <div
                  key={m.name}
                  className="flex items-start gap-4 rounded-2xl bg-white/80 ring-1 ring-black/5 p-5"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[#0A4A56]/10 grid place-items-center text-sm font-semibold">
                    {m.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">{m.name}</div>
                    <div className="text-sm text-[#0A4A56]/70">{m.role}</div>
                    {m.traits?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.traits.map((t) => (
                          <span
                            key={t}
                            className="text-xs rounded-full border border-[#0A4A56]/20 px-2 py-1 text-[#0A4A56]/80"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="col-start-2 row-start-2">
            <ContactMini />
          </div>
        </div>
      </section>
    </main>
  );
}
