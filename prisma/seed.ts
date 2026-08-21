import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.employee.createMany({
    data: [
      { name: "山田 太郎", isActive: true },
      { name: "佐藤 花子", isActive: true },
      { name: "鈴木 一郎", isActive: true },
    ],
  });

  await prisma.item.createMany({
    data: [
      { name: "コピー用紙(A4)", quantity: 20, threshold: 10, unit: "束", note: "500枚/束" },
      { name: "油性ボールペン(黒)", quantity: 5, threshold: 10, unit: "本", note: "発注点以下のサンプル" },
      { name: "USBメモリ 32GB", quantity: 8, threshold: 3, unit: "個", note: "" },
    ],
  });

  console.log("シードデータを投入しました。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
