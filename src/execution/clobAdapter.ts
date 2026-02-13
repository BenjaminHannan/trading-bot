export interface OrderRequest {
  tokenId: string;
  side: "BUY" | "SELL";
  price: number;
  size: number;
}

export interface ExecutionClient {
  placeOrder(req: OrderRequest): Promise<{ orderId: string }>;
  cancelOrder(orderId: string): Promise<void>;
  cancelAll(): Promise<void>;
}

export async function buildExecutionClient(config: {
  host: string;
  chainId: number;
  privateKey?: string;
  apiKey?: string;
  apiSecret?: string;
  apiPassphrase?: string;
  dryRun: boolean;
}): Promise<ExecutionClient> {
  if (config.dryRun) {
    return {
      placeOrder: async () => ({ orderId: `dry-${Date.now()}` }),
      cancelOrder: async () => undefined,
      cancelAll: async () => undefined
    };
  }

  let ClobClientCtor: any;
  try {
    const mod = await import("@polymarket/clob-client");
    ClobClientCtor = mod.ClobClient;
  } catch {
    throw new Error("Missing @polymarket/clob-client. Install it before enabling live trading.");
  }

  const client = new ClobClientCtor(
    config.host,
    config.chainId,
    config.privateKey,
    undefined,
    {
      key: config.apiKey,
      secret: config.apiSecret,
      passphrase: config.apiPassphrase
    }
  );

  return {
    placeOrder: async (req) => {
      const res = await client.createAndPostOrder({
        tokenID: req.tokenId,
        side: req.side,
        price: req.price,
        size: req.size
      });
      return { orderId: String(res.orderID ?? res.orderId ?? Date.now()) };
    },
    cancelOrder: async (orderId: string) => client.cancel(orderId),
    cancelAll: async () => client.cancelAll()
  };
}
