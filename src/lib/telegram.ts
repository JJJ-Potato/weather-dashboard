import { TELEGRAM_API_URL } from './constants';

export async function sendTelegramMessage(text: string): Promise<boolean> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set');
      return false;
    }

    const url = `${TELEGRAM_API_URL}/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Telegram API error: ${res.status}`, body);
      return false;
    }

    return true;
  } catch (err) {
    console.error('sendTelegramMessage error:', err);
    return false;
  }
}
