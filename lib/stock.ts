import { prisma } from "@/lib/prisma";
import { sendLowStockAlert } from "@/lib/mail";

export class InsufficientStockError extends Error {
  constructor(message = "在庫数が不足しているため登録できません。") {
    super(message);
    this.name = "InsufficientStockError";
  }
}

export type RegisterUsageInput = {
  itemId: number;
  employeeId: number;
  quantity: number;
  usedAt: Date;
};

/**
 * 使用履歴を1件登録し、同じトランザクション内でItemの在庫数を減算する。
 * 在庫数がマイナスになる場合はロールバックしてInsufficientStockErrorを投げる。
 */
export async function registerUsage(input: RegisterUsageInput) {
  const updatedItem = await prisma.$transaction(async (tx) => {
    const item = await tx.item.findUniqueOrThrow({ where: { id: input.itemId } });

    if (item.quantity - input.quantity < 0) {
      throw new InsufficientStockError();
    }

    await tx.usageLog.create({
      data: {
        itemId: input.itemId,
        employeeId: input.employeeId,
        quantity: input.quantity,
        usedAt: input.usedAt,
      },
    });

    return tx.item.update({
      where: { id: input.itemId },
      data: { quantity: { decrement: input.quantity } },
    });
  });

  await maybeNotifyLowStock(updatedItem);

  return updatedItem;
}

export type RegisterStockInInput = {
  itemId: number;
  quantity: number;
  receivedAt: Date;
};

/**
 * 入荷記録を1件登録し、同じトランザクション内でItemの在庫数を加算する。
 */
export async function registerStockIn(input: RegisterStockInInput) {
  return prisma.$transaction(async (tx) => {
    await tx.stockInLog.create({
      data: {
        itemId: input.itemId,
        quantity: input.quantity,
        receivedAt: input.receivedAt,
      },
    });

    return tx.item.update({
      where: { id: input.itemId },
      data: { quantity: { increment: input.quantity } },
    });
  });
}

type NotifiableItem = {
  id: number;
  name: string;
  quantity: number;
  threshold: number;
  unit: string;
};

/**
 * 在庫数が発注点以下の場合、直近の通知から一定時間（LOW_STOCK_RENOTIFY_HOURS）
 * 経過していれば管理者宛にメール通知を送り、送信履歴を記録する。
 * 戻り値はメールを実際に送信したかどうか。
 */
export async function maybeNotifyLowStock(item: NotifiableItem) {
  if (item.quantity > item.threshold) {
    return false;
  }

  const hours = Number(process.env.LOW_STOCK_RENOTIFY_HOURS ?? "24");
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  const recentNotice = await prisma.notificationLog.findFirst({
    where: { itemId: item.id, sentAt: { gt: cutoff } },
    orderBy: { sentAt: "desc" },
  });

  if (recentNotice) {
    return false;
  }

  try {
    await sendLowStockAlert(item);
  } catch (error) {
    // メール送信に失敗しても、在庫の登録・減算自体は成功として扱う。
    // ログだけ残し、次回のチェック時に再送を試みられるよう通知履歴は記録しない。
    console.error(`在庫僅少メールの送信に失敗しました（品目: ${item.name}）`, error);
    return false;
  }

  await prisma.notificationLog.create({ data: { itemId: item.id } });

  return true;
}
