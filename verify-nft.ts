import {
	createNft,
	fetchDigitalAsset,
	findMetadataPda,
	mplTokenMetadata,
	verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
	airdropIfRequired,
	getExplorerLink,
	getKeypairFromFile,
} from "@solana-developers/helpers";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
	generateSigner,
	keypairIdentity,
	percentAmount,
	publicKey,
} from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(
	connection,
	user.publicKey,
	10 * LAMPORTS_PER_SOL,
	0.1 * LAMPORTS_PER_SOL,
);

console.log("Loaded user", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey(
	"dkz3o5HMEUDhNAUgBNRBt6XdrXsA4FJRCsrCmgyKzh1",
);

const nftAddress = publicKey("6qQBj8XEQH6JpRpXyNNk2CQMNiJZtjEkN5Y1mkXdR7UT");

const transaction = await verifyCollectionV1(umi, {
	metadata: findMetadataPda(umi, { mint: nftAddress }),
	collectionMint: collectionAddress,
	authority: umi.identity,
});

await transaction.sendAndConfirm(umi);

console.log(
	`NFT ${nftAddress} verified! as member of collection ${collectionAddress}! see explorer at ${getExplorerLink("address", nftAddress, "devnet")}`,
);
