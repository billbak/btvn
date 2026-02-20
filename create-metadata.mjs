import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { homedir } from "os";
import { relative, resolve } from "path";

import {
  createV1,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import {
  createSignerFromKeypair,
  percentAmount,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";

// --- CLI argument parsing ---

function usage() {
  console.log(`Usage: node create-metadata.mjs [options]

Required:
  --mint <address>      Mint public key
  --name <name>         Token name
  --symbol <symbol>     Token symbol

One of (required):
  --metadata <path>     Local path to metadata JSON (infers raw GitHub URL from git remote)
  --uri <url>           Metadata JSON URI (overrides --metadata)

Optional:
  --rpc <url>           RPC endpoint (default: https://api.mainnet-beta.solana.com)
  --keypair <path>      Path to keypair JSON (default: ~/.config/solana/id.json)
  --help                Show this help message`);
  process.exit(0);
}

function inferUri(filePath) {
  const abs = resolve(filePath);
  if (!existsSync(abs)) {
    console.error(`Error: metadata file not found: ${abs}`);
    process.exit(1);
  }

  const repoRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf-8" }).trim();
  const remoteUrl = execSync("git remote get-url origin", { encoding: "utf-8" }).trim();
  const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();

  // Parse owner/repo from https://github.com/{owner}/{repo}.git or git@github.com:{owner}/{repo}.git
  const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (!match) {
    console.error(`Error: could not parse GitHub owner/repo from remote: ${remoteUrl}`);
    process.exit(1);
  }
  const [, owner, repo] = match;

  const relPath = relative(repoRoot, abs);
  const uri = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${relPath}`;
  console.log("Inferred URI:", uri);
  return uri;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--help") usage();
    if (argv[i].startsWith("--") && i + 1 < argv.length) {
      args[argv[i].slice(2)] = argv[++i];
    }
  }
  return args;
}

const args = parseArgs(process.argv);

const required = ["mint", "name", "symbol"];
const missing = required.filter((k) => !args[k]);
if (missing.length) {
  console.error(`Error: missing required arguments: ${missing.map((k) => `--${k}`).join(", ")}\n`);
  usage();
}
if (!args.uri && !args.metadata) {
  console.error("Error: must provide either --uri or --metadata\n");
  usage();
}

const resolvedUri = args.uri || inferUri(args.metadata);
const MINT_ADDRESS = args.mint;
const RPC_URL = args.rpc || "https://api.mainnet-beta.solana.com";
const KEYPAIR_PATH = args.keypair
  ? resolve(args.keypair)
  : resolve(homedir(), ".config/solana/id.json");

// --- Script logic (unchanged) ---

const umi = createUmi(RPC_URL)
  .use(mplTokenMetadata())
  .use(mplToolbox());

const secretKeyArray = JSON.parse(readFileSync(KEYPAIR_PATH, "utf-8"));
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKeyArray));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(signer));

console.log("Wallet:", signer.publicKey);
console.log("Mint:", MINT_ADDRESS);

const tx = await createV1(umi, {
  mint: publicKey(MINT_ADDRESS),
  authority: umi.identity,
  payer: umi.identity,
  updateAuthority: umi.identity.publicKey,
  name: args.name,
  symbol: args.symbol,
  uri: resolvedUri,
  sellerFeeBasisPoints: percentAmount(0),
  tokenStandard: TokenStandard.Fungible,
}).sendAndConfirm(umi);

const sig = base58.deserialize(tx.signature);
console.log("Success! Tx:", sig[0]);
console.log(`https://explorer.solana.com/tx/${sig[0]}`);
