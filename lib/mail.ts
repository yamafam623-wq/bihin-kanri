import nodemailer from "nodemailer";

export type LowStockItem = {
  name: string;
  quantity: number;
  threshold: number;
  unit: string;
};

function getTransporter() {
  const port = Number(process.env.SMTP_PORT ?? "587");
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

function getAlertRecipients() {
  return (process.env.ALERT_EMAILS ?? "")
    .split(",")
    .map((address) => address.trim())
    .filter(Boolean);
}

export async function sendLowStockAlert(item: LowStockItem) {
  const to = getAlertRecipients();
  if (to.length === 0) {
    console.warn("ALERT_EMAILS が未設定のため、在庫僅少メールを送信しませんでした。");
    return;
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@example.com",
    to,
    subject: `[備品在庫警告] ${item.name} が発注点を下回りました`,
    text: [
      `品目: ${item.name}`,
      `現在庫数: ${item.quantity} ${item.unit}`,
      `発注点: ${item.threshold} ${item.unit}`,
      "",
      "在庫の発注をご確認ください。",
    ].join("\n"),
  });
}
