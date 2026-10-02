/**
 * Outbound mail adapter.
 *
 * `hello@withmodus.co` is a RECEIVING alias (Namecheap forwarding). An
 * alias that forwards cannot send — outbound delivery needs a separately
 * verified transactional provider with a verified sending domain. Until
 * one is configured this module reports "not configured" rather than
 * pretending mail went out.
 *
 * Resend is used because it needs only an API key and a verified domain.
 * Swapping providers means replacing this file alone; the outbox, the
 * retry policy and the call sites do not change.
 */

export function isMailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

export type OutgoingMail = {
  to: string;
  subject: string;
  text: string;
  /** The submitter's address, where one was validated. */
  replyTo?: string;
};

export async function sendMail(mail: OutgoingMail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!apiKey || !from) throw new Error("Mail provider is not configured");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // `from` is always the verified sending domain. A submitter's
      // address goes in Reply-To and is never spoofed into From, which
      // would fail SPF/DKIM and get the domain classified as a forger.
      from,
      to: [mail.to],
      subject: mail.subject,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: [mail.replyTo] } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Mail provider rejected the message: ${response.status}`);
  }
}
