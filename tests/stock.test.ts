import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/mail", () => ({
  sendLowStockAlert: vi.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import { sendLowStockAlert } from "@/lib/mail";
import {
  registerUsage,
  registerStockIn,
  maybeNotifyLowStock,
  InsufficientStockError,
} from "@/lib/stock";

beforeEach(async () => {
  vi.clearAllMocks();
  await prisma.notificationLog.deleteMany();
  await prisma.stockInLog.deleteMany();
  await prisma.usageLog.deleteMany();
  await prisma.item.deleteMany();
  await prisma.employee.deleteMany();
});

describe("registerUsage", () => {
  it("使用登録すると在庫数が使用数量分だけ減算され、履歴が1件作成される", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品", quantity: 10, threshold: 3, unit: "個" },
    });
    const employee = await prisma.employee.create({
      data: { name: "テスト社員" },
    });

    const updated = await registerUsage({
      itemId: item.id,
      employeeId: employee.id,
      quantity: 4,
      usedAt: new Date(),
    });

    expect(updated.quantity).toBe(6);

    const logs = await prisma.usageLog.findMany({ where: { itemId: item.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].quantity).toBe(4);
    expect(logs[0].employeeId).toBe(employee.id);
  });

  it("在庫数を超える使用数量を登録しようとするとエラーになり、在庫も履歴も変化しない", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品2", quantity: 2, threshold: 1, unit: "個" },
    });
    const employee = await prisma.employee.create({
      data: { name: "テスト社員2" },
    });

    await expect(
      registerUsage({
        itemId: item.id,
        employeeId: employee.id,
        quantity: 5,
        usedAt: new Date(),
      })
    ).rejects.toThrow(InsufficientStockError);

    const reloaded = await prisma.item.findUniqueOrThrow({ where: { id: item.id } });
    expect(reloaded.quantity).toBe(2);

    const logs = await prisma.usageLog.findMany({ where: { itemId: item.id } });
    expect(logs).toHaveLength(0);
  });

  it("使用登録により在庫数が発注点以下になったらメール通知を送り、送信履歴を残す", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品3", quantity: 5, threshold: 3, unit: "個" },
    });
    const employee = await prisma.employee.create({
      data: { name: "テスト社員3" },
    });

    await registerUsage({
      itemId: item.id,
      employeeId: employee.id,
      quantity: 3,
      usedAt: new Date(),
    });

    expect(sendLowStockAlert).toHaveBeenCalledTimes(1);
    const notices = await prisma.notificationLog.findMany({
      where: { itemId: item.id },
    });
    expect(notices).toHaveLength(1);
  });

  it("在庫数が発注点を上回っている場合はメール通知を送らない", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品4", quantity: 10, threshold: 3, unit: "個" },
    });
    const employee = await prisma.employee.create({
      data: { name: "テスト社員4" },
    });

    await registerUsage({
      itemId: item.id,
      employeeId: employee.id,
      quantity: 1,
      usedAt: new Date(),
    });

    expect(sendLowStockAlert).not.toHaveBeenCalled();
  });
});

describe("registerStockIn", () => {
  it("入荷登録すると在庫数が入荷数量分だけ加算され、履歴が1件作成される", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品7", quantity: 5, threshold: 3, unit: "個" },
    });

    const updated = await registerStockIn({
      itemId: item.id,
      quantity: 20,
      receivedAt: new Date(),
    });

    expect(updated.quantity).toBe(25);

    const logs = await prisma.stockInLog.findMany({ where: { itemId: item.id } });
    expect(logs).toHaveLength(1);
    expect(logs[0].quantity).toBe(20);
  });
});

describe("maybeNotifyLowStock", () => {
  it("直近の再送間隔（LOW_STOCK_RENOTIFY_HOURS）以内に通知済みの場合は再送しない", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品5", quantity: 1, threshold: 5, unit: "個" },
    });
    await prisma.notificationLog.create({ data: { itemId: item.id } });

    const sent = await maybeNotifyLowStock(item);

    expect(sent).toBe(false);
    expect(sendLowStockAlert).not.toHaveBeenCalled();
  });

  it("再送間隔を過ぎていれば再度メール通知を送る", async () => {
    const item = await prisma.item.create({
      data: { name: "テスト備品6", quantity: 1, threshold: 5, unit: "個" },
    });
    const overOneDayAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    await prisma.notificationLog.create({
      data: { itemId: item.id, sentAt: overOneDayAgo },
    });

    const sent = await maybeNotifyLowStock(item);

    expect(sent).toBe(true);
    expect(sendLowStockAlert).toHaveBeenCalledTimes(1);
  });
});
