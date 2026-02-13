const pk = process.env.PRIVATE_KEY;
if (!pk) {
  console.error("PRIVATE_KEY not set");
  process.exit(1);
}

console.log("Use official @polymarket/clob-client key tooling to derive/create API credentials.");
console.log("For safety, this helper never prints secrets automatically.");
console.log("Run an interactive secure workflow and store only in environment variables.");
