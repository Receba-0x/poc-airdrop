const fs = require("fs");
const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} = require("@solana/web3.js");
const {
  getCreateMetadataAccountV3InstructionDataSerializer,
} = require("@metaplex-foundation/mpl-token-metadata");

// ✅ Program ID fixo do Token Metadata (Metaplex)
const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

// 1) RPC – use devnet ou mainnet-beta
const RPC_URL = "https://api.devnet.solana.com"; // troque se estiver na mainnet

// 2) Mint do seu token RECEBA
const MINT_ADDRESS = "E5RuDrNgfu8RPjvmze1CfHYSTemziZzCBuTtoWHggu9R";

// 3) Caminho do seu keypair (arquivo .json dentro da pasta metaplex-metadata)
const KEYPAIR_PATH =
  "./aVGKSj8JzUSasrXxBb8LYEH4m4KvVM5WH2aivXGDhKq.json";

// 4) URI do metadata.json
const METADATA_URI =
  "https://bafybeidlzr73hvejqjx33iadchb4fdc7tknmehtqthqkgf75c5b7y5nr54.ipfs.w3s.link/metadata.json";

async function main() {
  const connection = new Connection(RPC_URL, "confirmed");

  // Verifica se o arquivo do keypair existe
  if (!fs.existsSync(KEYPAIR_PATH)) {
    throw new Error(`Arquivo do keypair não encontrado: ${KEYPAIR_PATH}`);
  }

  // Lê o keypair
  const secretKeyString = fs.readFileSync(KEYPAIR_PATH, "utf8");
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const payer = Keypair.fromSecretKey(secretKey);

  console.log("Payer Public Key:", payer.publicKey.toString());

  const mint = new PublicKey(MINT_ADDRESS);
  console.log("Mint Address:", mint.toString());

  // Deriva o PDA da metadata (Metaplex)
  // Ordem correta dos seeds: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint]
  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  console.log("Metadata PDA:", metadataPda.toString());

  // Verifica se a metadata já existe
  try {
    const metadataAccountInfo = await connection.getAccountInfo(metadataPda);
    if (metadataAccountInfo) {
      console.warn("⚠️  Metadata já existe para este mint!");
      console.log("Metadata Account:", metadataPda.toString());
      return;
    }
  } catch (error) {
    // Metadata não existe, pode prosseguir
    console.log("Metadata não existe ainda, criando...");
  }

  // Dados da metadata
  const dataV2 = {
    name: "RECEBA AIRDROP",
    symbol: "RECEBA",
    uri: METADATA_URI,
    sellerFeeBasisPoints: 0, // fungible token, sem royalty
    creators: null,
    collection: null,
    uses: null,
  };

  // Argumentos da instrução
  const args = {
    data: dataV2,
    isMutable: true,
    collectionDetails: null,
  };

  // Serializa os dados da instrução
  const serializer = getCreateMetadataAccountV3InstructionDataSerializer();
  const instructionData = serializer.serialize(args);

  // Cria a instrução manualmente
  const keys = [
    {
      pubkey: metadataPda,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: mint,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: payer.publicKey,
      isSigner: true,
      isWritable: false,
    },
    {
      pubkey: payer.publicKey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: payer.publicKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
  ];

  const ix = {
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys,
    data: instructionData,
  };

  console.log("Criando instrução de metadata...");
  const tx = new Transaction().add(ix);

  console.log("Enviando transação...");
  const sig = await sendAndConfirmTransaction(connection, tx, [payer], {
    commitment: "confirmed",
  });
  
  console.log("✅ Metadata criada com sucesso!");
  console.log("Signature:", sig);
  console.log("Explorer:", `https://explorer.solana.com/tx/${sig}?cluster=devnet`);
}

main().catch((err) => {
  console.error("Erro ao criar metadata:", err);
  process.exit(1);
});
