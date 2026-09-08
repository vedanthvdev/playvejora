export type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

export type Mailer = {
  send(message: MailMessage): Promise<void>;
};

let injected: Mailer | null = null;

export function useMailer(mailer: Mailer | null): void {
  injected = mailer;
}

export function organizerMailbox(): string {
  return process.env.ORGANIZER_EMAIL?.trim() || "playvejora@gmail.com";
}

export function mailFrom(): string {
  return process.env.MAIL_FROM?.trim() || "PlayVejora <beth.t@example.com>";
}

export async function getMailer(): Promise<Mailer> {
  if (injected) {
    return injected;
  }
  return resendMailer();
}

function resendMailer(): Mailer {
  return {
    async send(message) {
      const key = process.env.RESEND_API_KEY?.trim();
      if (!key) {
        return;
      }
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: mailFrom(),
          to: [message.to],
          subject: message.subject,
          text: message.text,
        }),
      });
      if (!response.ok) {
        throw new Error(`Mail send failed with ${response.status}.`);
      }
    },
  };
}
