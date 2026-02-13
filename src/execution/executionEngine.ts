import { ExecutionClient, OrderRequest } from "./clobAdapter.js";

export class ExecutionEngine {
  constructor(private readonly client: ExecutionClient) {}

  async cancelReplace(existingOrderIds: string[], nextOrders: OrderRequest[]): Promise<string[]> {
    for (const id of existingOrderIds) await this.client.cancelOrder(id);
    const placed: string[] = [];
    for (const o of nextOrders) {
      const res = await this.client.placeOrder(o);
      placed.push(res.orderId);
    }
    return placed;
  }

  async emergencyCancelAll(): Promise<void> {
    await this.client.cancelAll();
  }
}
