import "server-only";

import { v2 as cloudinary } from "cloudinary";

import { getCloudinaryCredentials } from "./config";

/**
 * The configured Cloudinary SDK — server only.
 *
 * The `server-only` import on line 1 is the safeguard: the API secret signs
 * every upload and every delivery URL, so a Client Component that pulls this
 * module in, directly or through a barrel, must fail the build rather than ship
 * the secret to a browser.
 *
 * Configuration is applied lazily on first use, not at import time, so a route
 * that merely imports a module in this folder still prerenders in an
 * environment with no Cloudinary credentials.
 *
 * The SDK keeps its config in module-level global state, which is why this is a
 * function and not an exported instance: each server runtime graph configures
 * its own copy the first time it needs one.
 */

let configured = false;

export function getCloudinary() {
  if (!configured) {
    const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    configured = true;
  }

  return cloudinary;
}
