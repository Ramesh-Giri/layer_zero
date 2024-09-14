import { ethers } from 'ethers';
import networkConfig from './config/networks';
import express from 'express';
import { setPeerContracts, setEnforcedOptions, estimateSendFees } from './utils/functions';



function initializeNetworks(env: 'mainnet' | 'testnet', signer: ethers.Signer): any[] {
    const selectedConfig = networkConfig[env];
    return Object.keys(selectedConfig).map((networkKey) => {
        const network = selectedConfig[networkKey];
        const provider = signer.provider;

        return {
            networkKey,
            provider,
            wallet: signer, // Use the provided signer instead of a wallet from a private key
            oftAddress: network.oftAddress,
            adapterAddress: network.adapterAddress,
            endpointId: network.endpointId,
        };
    });
}

// Set up Express
const app = express();
app.use(express.json());

app.post('/estimate-gas', async (req, res) => {
    const { endpointId, amount, isBaseNetwork, optionsData, walletProvider } = req.body;

    try {
        const provider = walletProvider;
        const signer = await provider.getSigner(); // Await here to get the resolved JsonRpcSigner

        // Initialize networks and set peer contracts as needed
        //const networks = initializeNetworks('mainnet', signer);
        //await setPeerContracts({ networks, signer });

        // Set enforced options for transactions and estimate gas
    
        const estimatedGas = await estimateSendFees(endpointId, amount, isBaseNetwork, optionsData, signer);

        res.json({ estimatedGas });
    } catch (error) {
        console.error(`Error estimating gas: ${error}`);
        res.status(500).json({ error: 'Failed to estimate gas' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
