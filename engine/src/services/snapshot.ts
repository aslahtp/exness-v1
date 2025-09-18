import { createClient } from "redis";
import type {
  AssetBalance,
  BalanceAssets,
  OpenOrder,
  SnapShot,
  SnapshotMetadata,
} from "../types/types";

const snapshotClient = createClient();

snapshotClient.connect();

export class SnapshotService {
  static async saveSnapshot(
    openOrders: Record<string, OpenOrder>,
    userBalances: Record<string, Record<BalanceAssets, AssetBalance>>,
    offset_id: string
  ): Promise<string> {
    const timestamp = Date.now();
    const snapshotId = `${timestamp}`;

    const snapshot: SnapShot = {
      timestamp,
      offset_id,
      open_orders: openOrders,
      user_balances: userBalances,
    };

    await snapshotClient.set(
      `snapshot:${snapshotId}`,
      JSON.stringify(snapshot),
      {
        EX: 60 * 60 * 24 * 7,
      }
    );

    console.log("Snapshot saved successfully");
    this.updateSnapshotMeta(snapshotId, snapshot.timestamp, snapshot.offset_id);
    return snapshotId;
  }

  private static async updateSnapshotMeta(
    latestSnapshotId: string,
    lastSnapshotTime: number,
    latestSnapshotOffsetId: string
  ) {
    const snapshotMeta: SnapshotMetadata = {
      lastSnapshotTime,
      latestSnapshotId,
      latestSnapshotOffsetId,
    };
    await snapshotClient.set(
      "latestSnapshotMeta",
      JSON.stringify(snapshotMeta)
    );
    console.log("Snapshot metadata updated successfully");
  }

  private static async getSnapshotMetadata(): Promise<SnapshotMetadata | null> {
    const metadata = await snapshotClient.get("latestSnapshotMeta");

    return metadata ? JSON.parse(metadata) : null;
  }

  static async loadLatestSnapshot(): Promise<{
    snapshot: SnapShot | null;
    snapshotId: string | null;
  }> {
    const metadata = await this.getSnapshotMetadata();

    if (!metadata || !metadata.latestSnapshotId) {
      console.log("No snapshots found");
      return { snapshot: null, snapshotId: null };
    }

    const snapshotData = await snapshotClient.get(
      `snapshot:${metadata.latestSnapshotId}`
    );

    if (!snapshotData) {
      console.log("snaphsot data not found");
      return { snapshot: null, snapshotId: null };
    }

    const snaphsot: SnapShot = JSON.parse(snapshotData);

    console.log("Snapshot loaded successfully");

    return {
      snapshot: snaphsot,
      snapshotId: metadata.latestSnapshotId,
    };
  }
}
