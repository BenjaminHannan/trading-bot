import { Logger } from "../shared/logger.js";

export interface SubmitOrder { tokenId: string; side: "BUY" | "SELL"; price: number; size: number }

export class Executor {
  private client: any = null;

  constructor(private readonly logger: Logger, private readonly cfg: {
    dryRun: boolean;
    host: string;
    chainId: number;
    privateKey?: string;
    apiKey?: string;
    apiSecret?: string;
    apiPassphrase?: string;
  }) {}

  async init(): Promise<void> {
    if (this.cfg.dryRun) return;
    const mod = await import("@polymarket/clob-client");
    const Ctor = (mod as any).ClobClient;
    this.client = new Ctor(this.cfg.host, this.cfg.chainId, this.cfg.privateKey, undefined, {
      key: this.cfg.apiKey,
      secret: this.cfg.apiSecret,
      passphrase: this.cfg.apiPassphrase
    });
  }

  async submit(order: SubmitOrder): Promise<void> {
    if (this.cfg.dryRun) {
      this.logger.info("dry_run_order", { tokenId: order.tokenId, side: order.side, price: order.price, size: order.size });
      return;
    }
    await this.client.createAndPostOrder({ tokenID: order.tokenId, side: order.side, price: order.price, size: order.size });
  }

  async cancelAll(): Promise<void> {
    if (this.cfg.dryRun) return;
    await this.client.cancelAll();
  }
}
