import { ethers } from 'ethers';
import dotenv from 'dotenv';
import networkConfig from './config/networks';
import express from 'express';
import { setPeerContracts, setEnforcedOptions, estimateSendFees } from './utils/functions';


function initializeNetworks(env: 'mainnet' | 'testnet', signer: ethers.Signer): any[] {
    const selectedConfig = networkConfig[env];
    return Object.keys(selectedConfig).map((networkKey) => {
        const network = selectedConfig[networkKey];
        const provider = signer.provider as ethers.JsonRpcProvider;

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

// Middleware to parse JSON bodies
app.use(express.json());

// Define the POST /estimate-gas route
app.post('/estimate-gas', async (req, res) => {
    const { endpointId, amount, isBaseNetwork, optionsData, walletProviderUrl } = req.body;

    try {
        // Initialize provider using the wallet provider URL
        const provider = new ethers.JsonRpcProvider(walletProviderUrl);
        const signer = await provider.getSigner(); // Obtain the signer

        // Estimate gas
        const parsedAmount = ethers.parseUnits(amount, 18);
        const estimatedGas = await estimateSendFees(endpointId, parsedAmount, isBaseNetwork, optionsData, signer);

        res.json({ estimatedGas });
    } catch (error) {
        console.error(`Error estimating gas: ${error}`);
        res.status(500).json({ error: 'Failed to estimate gas' });
    }
});

// 404 handler - this should be after all other routes
app.use((req, res, next) => {
    console.log(`Request received for ${req.method} ${req.url}`);
    res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
