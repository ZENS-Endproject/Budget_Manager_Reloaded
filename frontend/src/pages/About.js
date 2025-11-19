import React from "react";
import ContactMini from "../components/ContactMini";
import { useTranslation } from "react-i18next";
import i18n from "../locales/i18n";

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
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <section className="pt-4 pb-12">
        <div
          className="about-grid px-6 gap-2"
          style={{
            paddingLeft: `calc(var(--sidebar-width, 0px) + ${gutter}px)`,
          }}
        >
          {/* What is ZENS? */}
          <article className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7">
            <h2 className="text-[18px] font-semibold mb-3">
              {t("whatIsZens")}
            </h2>
            <div className="space-y-3 text-[14px] leading-relaxed text-[var(--muted)]">
              <p>{t("p1")}</p>
              <p>{t("p2")}</p>
              <p>{t("p3")}</p>
            </div>
          </article>

          {/* Impressum */}
          <aside className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7 h-fit">
            <h2 className="text-[18px] font-semibold mb-3">Impressum</h2>
            <div className="space-y-4 text-[13px] text-[var(--muted)]">
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

          {/* Team */}
          <article className="rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7">
            <h2 className="text-[18px] font-semibold mb-5">
              {t("thisIsOurTeam")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {team.map((m) => (
                <div
                  key={m.name}
                  className="flex items-start gap-4 rounded-2xl bg-[var(--surface-strong)] ring-1 ring-[var(--border)] p-5"
                >
                  <div className="w-14 h-14 shrink-0 rounded-full bg-[var(--chip-bg)] grid place-items-center text-sm font-semibold">
                    {m.name
                      .split(" ")
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">{m.name}</div>
                    <div className="text-sm text-[var(--muted)]">{m.role}</div>
                    {m.traits?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.traits.map((t) => (
                          <span
                            key={t}
                            className="text-xs rounded-full border px-2 py-1 text-[color:var(--text)]/80 border-[var(--chip-border)]"
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

          {/* Contact form */}
          <div className="rounded-2xl bg-[var(--surface-strong)] shadow-sm ring-1 ring-[var(--border)] p-6 md:p-7">
            <ContactMini />
          </div>
        </div>
      </section>
    </main>
  );
}
