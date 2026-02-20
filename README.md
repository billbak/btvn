# meme coin

This is the process I used to create a meme coin on Solana. I used the command line and some JavaScript code to set the metadata. I used the Metaplex UMI SDK (not the Metaplex CLI/Sugar, which I could not get to run on my M2 Mac).

The coins I have made are for fun only. They have no value and no one can mine any additional coins. I have not set up any liquidity pools.

## Resources

- [Solana CLI documentation](https://docs.solana.com/cli)
- [SPL Token CLI documentation](https://spl.solana.com/token)
- Claude Code (of course)

### Node.js

Node.js is required to run the metadata script. Install it with Homebrew:

```bash
brew install node
node --version
```

### Solana command line interface (CLI)

I installed this with Homebrew:

```bash
brew install solana
solana --version
```

### SPL Token CLI

This is a Rust program that provides a command line interface for creating and managing SPL tokens on the Solana blockchain.

First I installed Rust with Homebrew:

```bash
brew install rust
```

Then I installed spl-token-cli with Cargo:

```bash
cargo install spl-token-cli
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
spl-token --version
```

## Steps

### Point the CLI at mainnet and verify

```bash
solana config set --url https://api.mainnet-beta.solana.com

solana config get
```

### Generate the key pair

```bash
solana-keygen new --outfile ~/.config/solana/id.json
```

I skipped the pass phrase. The command will print the public address and the seed phrase you can use to recover the key. I saved the seed phrase in a secure location. DO NOT COMMIT THE FILE OR THE SEED PHRASE.

### Back up the key pair

```bash
cp ~/.config/solana/id.json ~/solana-id.json   ## Or anywhere you prefer
gpg --symmetric --cipher-algo AES256 ~/solana-id.json ## Encrypt the file with a passphrase
rm ~/solana-id.json ## Remove the unencrypted file
```

Copy the encrypted file (~/solana-id.json.gpg) to a secure location, such as an external drive or cloud storage.

### Show the public address

```bash
solana-keygen pubkey ~/.config/solana/id.json
```

You need this for the next step.

### Send 0.2 SOL to the new address

Use some wallet that contains SOL to send 0.2 SOL to the new address. This is needed to pay for transaction fees and account creation. These fees are called "gas fees" on Ethereum, but Solana just calls them "fees". You can use any wallet that supports Solana, such as Phantom or Solflare.

### Verify the balance

```bash
solana balance
```

### Mint a new token

```bash
spl-token create-token --decimals 0

Creating token <TOKEN_ID> under program <PROGRAM_ID>

Address: <TOKEN_ID>
Decimals: 0

Signature: wzYkn...vfM5Qe
```

This command creates a new token with 0 decimals (i.e., indivisible) and returns the token address, which is needed for the next steps. The token address is also called the "mint address" because it represents the mint of the token.

### Create an account to hold the tokens

```bash
spl-token create-account <TOKEN_ID>

Creating account <RECIPIENT_ID>

Signature: 4pLBv...x1AK8
```

This command creates a new token account that can hold the tokens of the specified mint. The token account address is also needed for the next steps. The token account is associated with the wallet address, so only the owner of the wallet can access the tokens in that account.

### Mint some tokens to the account

```bash
spl-token mint <TOKEN_ID> 1000

Minting 1000 tokens
Token: <TOKEN_ID>
Recipient: <RECIPIENT_ID>

Signature: 5ztu...R6YoL
```

This command mints 1000 tokens of the specified mint to the specified recipient token account. The recipient must be a token account that can hold the tokens of the specified mint. The minting authority must be the owner of the mint, which is the wallet address that created the mint. By default, the minting authority is set to the wallet address that created the mint, but it can be changed with the `spl-token authorize` command.

### Check the balance

```bash
spl-token balance <TOKEN_ID>
1000
```

This command checks the balance of the specified token account. It should return 1000, which is the amount of tokens that were minted to that account. You can also check the balance with a wallet that supports Solana, such as Phantom or Solflare, by adding the token to the wallet with the mint address.

### Set the metadata

This step is a bit more complicated because it requires some JavaScript code to interact with the Metaplex Token Metadata program. We have a Node program called `create-metadata.mjs` that does this. First, install the dependencies:

```bash
npm install
```

Then run the script:

```bash
node create-metadata.mjs --mint <TOKEN_ID> --name <NAME> --symbol <SYMBOL> --metadata <METADATA_PATH>
```

Be sure to have a metadata JSON file that follows the Metaplex standard. The `--metadata` flag should point to the local path of the JSON file. The script will infer the raw GitHub URL based on the file's location in the git repository. The metadata JSON file should include the name, symbol, description, image URL, and properties of the token. The image URL should point to a 512x512 PNG file that represents the token's icon.

See any of the metadata.json files in this repo for an example. You can also use the `--uri` flag to specify the metadata URI directly, but using `--metadata` is more convenient because it automatically infers the URI from the file path and git remote.

The script will write the metadata on-chain for the specified mint address. After running the script, you should be able to see the token's name, symbol, and image in wallets that support Solana tokens, such as Phantom or Solflare. You will see a link to the Solana Explorer page for the token, where you can verify that the metadata was set correctly.

At this point, the token is fully functional and can be transferred, traded, or used in any way that other Solana tokens can be. Only the account that owns the mint can transfer tokens to other wallets.

### Lock it down (forever) [Do this last, after setting metadata]

```bash
spl-token authorize <TOKEN_ID> mint --disable

Updating <TOKEN_ID>
Current mint: <MINT_ADDRESS>
New mint: disabled

Signature: 34ypF...Nsxoe
```

### Verify on chain

```bash
spl-token account-info <TOKEN_ID>

SPL Token Account
Address: <ACCOUNT_ADDRESS>
Program: <PROGRAM_ADDRESS>
Balance: 1000
Decimals: 0
Mint: <MINT_ADDRESS>
Owner: <OWNER_ADDRESS>
State: Initialized
Delegation: (not set)
Close authority: (not set)
```

---

You are done! You have created a new meme coin on Solana with custom metadata. You can share the mint address and the metadata URI with others so they can view the token in their wallets or trade it on decentralized exchanges that support Solana tokens.
