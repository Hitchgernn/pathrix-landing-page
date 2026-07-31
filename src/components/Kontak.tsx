import { useState } from "react";
import styles from "./Kontak.module.css";
import { contactEmail, contactEndpoint, kontak } from "../content/site";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * Contact form.
 *
 * There is no backend yet. Rather than faking a success state, the form posts to
 * VITE_CONTACT_ENDPOINT when one is configured, and otherwise hands off to the
 * user's mail client via mailto: — the confirmation shown then describes what
 * actually happened.
 */
export function Kontak() {
  const [status, setStatus] = useState<Status>("idle");
  const hasEndpoint = contactEndpoint.length > 0;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const nama = String(data.get("nama") ?? "");
    const kontakValue = String(data.get("kontak") ?? "");
    const pesan = String(data.get("pesan") ?? "");

    if (!hasEndpoint) {
      // No backend: compose a real message instead of pretending it was sent.
      const subject = `Pathrix — pesan dari ${nama}`;
      const body = `Nama: ${nama}\nSurel atau instansi: ${kontakValue}\n\n${pesan}`;
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ nama, kontak: kontakValue, pesan }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const label =
    status === "sending"
      ? "Mengirim…"
      : status === "sent"
        ? kontak.submitSentLabel
        : kontak.submitLabel;

  return (
    <section id="kontak" className={styles.section} aria-labelledby="kontak-heading">
      <div className={styles.shell}>
        <div className={styles.pitch}>
          <span className={styles.eyebrow} data-reveal>
            {kontak.eyebrow}
          </span>
          <h2 id="kontak-heading" className={styles.heading} data-reveal>
            {kontak.heading}
          </h2>
          <p className={styles.body} data-reveal>
            {kontak.body}
          </p>
          <div className={styles.emailBlock} data-reveal>
            <span className={styles.emailLabel}>{kontak.emailLabel}</span>
            <a className={styles.email} href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
          </div>
        </div>

        <form className={styles.form} onSubmit={onSubmit} data-reveal>
          <label className={styles.label}>
            {kontak.fields.nama.label}
            <input
              className={styles.input}
              type="text"
              name="nama"
              required
              autoComplete="name"
              placeholder={kontak.fields.nama.placeholder}
            />
          </label>
          <label className={styles.label}>
            {kontak.fields.kontak.label}
            <input
              className={styles.input}
              type="text"
              name="kontak"
              required
              autoComplete="email"
              placeholder={kontak.fields.kontak.placeholder}
            />
          </label>
          <label className={styles.label}>
            {kontak.fields.pesan.label}
            <textarea
              className={styles.textarea}
              name="pesan"
              rows={4}
              placeholder={kontak.fields.pesan.placeholder}
            />
          </label>
          <button className={styles.submit} type="submit" disabled={status === "sending"}>
            {label}
            <span className={styles.arrow} aria-hidden="true">
              &#8594;
            </span>
          </button>

          <p className={styles.note} role="status" aria-live="polite">
            {status === "sent" && "Terima kasih — pesanmu tercatat."}
            {status === "error" && "Pesan gagal terkirim. Coba lagi atau kirim lewat surel."}
          </p>
        </form>
      </div>
    </section>
  );
}
