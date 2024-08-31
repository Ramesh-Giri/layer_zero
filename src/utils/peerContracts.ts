// src/utils/peerContracts.ts

import { ethers } from "ethers";

interface NetworkConfig {
    networkKey: string;
    provider: ethers.JsonRpcProvider;
    wallet: ethers.Wallet;
    oftAddress: string;
    adapterAddress: string;
    endpointId: string;
}

export async function setPeerContracts({
    networks,
}: {
    networks: NetworkConfig[];
}) {
    try {
        for (const sourceNetwork of networks) {
            const sourceAdapterBytes32 = ethers.hexlify(sourceNetwork.adapterAddress);
            const sourceOFTContract = new ethers.Contract(sourceNetwork.oftAddress, require(`../artifacts/contracts/WhaleOFT.sol/WhaleOFT.json`).abi, sourceNetwork.wallet);

            for (const destinationNetwork of networks) {
                if (sourceNetwork.networkKey === destinationNetwork.networkKey) continue; // Skip pairing with the same network

                const destinationOFTBytes32 = ethers.zeroPadValue(destinationNetwork.oftAddress, 32);


                const destinationAdapterContract = new ethers.Contract(destinationNetwork.adapterAddress, require(`../artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json`).abi, destinationNetwork.wallet);

                // Check pairing status between source adapter and destination OFT
                const isAdapterPeerOfOFT = await sourceOFTContract.isPeer(sourceNetwork.endpointId, destinationOFTBytes32);
                const isOFTPeerOfAdapter = await destinationAdapterContract.isPeer(destinationNetwork.endpointId, sourceAdapterBytes32);

                if (!isAdapterPeerOfOFT || !isOFTPeerOfAdapter) {
                    console.log(`Pairing ${sourceNetwork.networkKey} Adapter to ${destinationNetwork.networkKey} OFT...`);

                    // Pair source adapter to destination OFT
                    const txAdapter = await sourceOFTContract.setPeer(destinationNetwork.endpointId, destinationOFTBytes32);
                    await txAdapter.wait();
                    console.log(`Peered ${destinationNetwork.networkKey} OFT to ${sourceNetwork.networkKey} Adapter`);

                    // Pair destination OFT to source adapter
                    const txOFT = await destinationAdapterContract.setPeer(sourceNetwork.endpointId, sourceAdapterBytes32);
                    await txOFT.wait();
                    console.log(`Peered ${sourceNetwork.networkKey} Adapter to ${destinationNetwork.networkKey} OFT`);
                } else {
                    console.log(`${sourceNetwork.networkKey} Adapter and ${destinationNetwork.networkKey} OFT are already paired.`);
                }
            }
        }
    } catch (error) {
        console.error("An error occurred during the peer contract setup:", error);
    }
}
