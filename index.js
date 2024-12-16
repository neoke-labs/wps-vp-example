const WPS_API_KEY = "c4ef9c1b-ea9c-48c2-9b33-e7400287032b";
const WPS_URL = "https://cw.dev.neoke.com/wps";
const WALLET_ALIAS = "verifier";
const TEMPLATE = {
  signin: "6636a28f-81e8-4659-a20b-969867db459c",
  signup: "5acea106-2cd2-48f1-be20-0c2e6fefc08b",
};

const { CALLBACK, REDIRECT_URI, MODE = "signup" } = process.env;

if (Object.keys(TEMPLATE).indexOf(MODE) === -1) {
  console.error(
    `Invalid mode '${MODE}' should be one of: ${Object.keys(TEMPLATE).join(
      ", "
    )}`
  );
  process.exit(1);
}

const url = `${WPS_URL}/wallet/generate-presentation-request/${WALLET_ALIAS}`;
const params = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "wps-api-key": WPS_API_KEY,
  },
  body: JSON.stringify({
    ...(CALLBACK ? { callback: CALLBACK } : {}),
    ...(REDIRECT_URI ? { redirect_uri: REDIRECT_URI } : {}),
    template: TEMPLATE[MODE],
  }),
};
const { deeplink, id } = await fetch(url, params)
  .then((r) => r.json())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

console.log("=======================================================");
console.log(`=== URL    = ${url}`);
console.log(`=== PARAMS = ${JSON.stringify(params, null, 2)}`);
console.log("=======================================================");
const status = `curl --location ${WPS_URL}/wallet/presentation-request-status/${WALLET_ALIAS}/${id} --header 'wps-api-key: ${WPS_API_KEY}`;
console.log({
  request_type: MODE,
  deeplink,
  status,
  callback: CALLBACK ?? "none",
  redirect_uri: REDIRECT_URI ?? "none",
});

console.log("\n\n\n");
console.log("=================== To check VP status, run: =============");
console.log(status);
console.log("\n\n\n");

console.log("=================== To get the VP, use: ==================");

console.log("Open QR code in navigator:");
console.log(
  "\t" +
    `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${deeplink}`
);
console.log("\n\n\n");
console.log(
  "If QR code does not work, use the deeplink in a qr generator service (type text)"
);
console.log("\t" + deeplink);

console.log(
  "Scan the QR code with neoke wallet to complete the Verifiable Presentation"
);

console.log("=====================================================");
console.log(
  "To customise the VP with your callback and redirect_uri, use the following command"
);
console.log(
  "CALLBACK=https://example.url/callback " +
    "REDIRECT_URI=https://example.url/redirect_uri" +
    " node index.js"
);
