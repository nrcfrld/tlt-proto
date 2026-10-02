/** getRandomValues also works on HTTP LAN previews where randomUUID is unavailable. */
export const createId = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
