import { Logger } from "./logger.js";

export async function enforceGeoBlock(blockedCountries: string[], logger: Logger): Promise<void> {
  const country = process.env.COUNTRY_CODE ?? "";
  if (country && blockedCountries.includes(country.toUpperCase())) {
    logger.error("geoblock check failed", { country });
    throw new Error("Trading blocked in this geography.");
  }
  logger.info("geoblock check passed", { country: country || "unknown" });
}
