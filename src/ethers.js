"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const dotenv_1 = __importDefault(require("dotenv"));
const tokenABI = require('./abi/WhaleTokens.json');
// Load environment variables from .env file
dotenv_1.default.config();
const MNEMONIC = process.env.MNEMONIC;
const RPC_URL_SOURCE = 'https://sepolia.base.org';
const RPC_URL_DESTINATION = 'https://sepolia.infura.io/v3/6ae62b79ee1341898f1ac24796ada458';
if (!MNEMONIC) {
    console.error('MNEMONIC not found in environment variables');
    process.exit(1);
}
const SOURCE_ENDPOINT_ID = '40245'; // here base 
const DESTINATION_ENDPOINT_ID = '40161'; // here sepolia 
/* -------------------------------- ERC 20 contract ( SOURCE:  here: BASE_ SEP)-------------------------------- */
// Using Sepolia network's Infura endpoint
const sourceProvider = new ethers_1.ethers.providers.JsonRpcProvider(RPC_URL_SOURCE);
// Connect to the Ethereum network
// Create a wallet from the mnemonic
const walletSource = ethers_1.ethers.Wallet.fromMnemonic(MNEMONIC);
// Connect the wallet to the provider to create a signer
const signer = walletSource.connect(sourceProvider);
const whaleERC20Address = '0xCa8e44C73cDCA309EA7615bC74fC1452BE9B3e49'; //ERC token address deployed on source
const whaleERC20Contract = new ethers_1.ethers.Contract(whaleERC20Address, tokenABI, signer);
/* -------------------------------- OFT on Base (destination: here: Sepolia) -------------------------------- */
const OFT_ABI = require('../artifacts/contracts/WhaleOFT.sol/WhaleOFT.json').abi;
const destinationProvider = new ethers_1.ethers.providers.JsonRpcProvider(RPC_URL_DESTINATION);
const walletDestination = ethers_1.ethers.Wallet.fromMnemonic(MNEMONIC).connect(destinationProvider);
const destinationOftAddress = '0x57827B96CE8f99eed1925c2DfEfb67186FB57915';
const destinationOFTContract = new ethers_1.ethers.Contract(destinationOftAddress, OFT_ABI, walletDestination);
const userAddress = "0x3b3d39D059C7C4F14C827E4f32793fe8f2F13F3C";
/* -------------------------------- OFT Adapter (SOURCE: here: SEPOLIA)-------------------------------- */
const ADAPTER_ABI = require('../artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json').abi;
const walletAdapter = ethers_1.ethers.Wallet.fromMnemonic(MNEMONIC).connect(sourceProvider);
const sourceAdapterAddress = '0x13baE193504AEc9Cb0103d500417ED80058939d4';
const sourceAdapterContract = new ethers_1.ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
// Function to Set Enforced Options
// Function to Set Enforced Options
async function setEnforcedOptions() {
    const Options = require('@layerzerolabs/lz-v2-utilities').Options;
    // Define the options
    const _options = Options.newOptions()
        .addExecutorLzReceiveOption(1000000, 1);
    // Encode options to hex string
    const optionsData = _options.toHex();
    console.log('Enforced options:', optionsData);
    // Display structured data of options
    console.log('Options Data:', JSON.stringify({ gasLimit: 1000000, msgValue: 1 }, null, 2));
    console.log('Fetching the enforced options:');
    const enforcedOptions = [
        {
            eid: DESTINATION_ENDPOINT_ID,
            msgType: 1,
            options: optionsData
        }
    ];
    try {
        const nonce = await sourceProvider.getTransactionCount(walletSource.address, 'latest'); // Get the current nonce
        console.log('Sending transaction with nonce:', nonce);
        const txResponse = await sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
            gasLimit: 1000000, // Adjusted gas limit if needed
            gasPrice: ethers_1.ethers.utils.parseUnits("23", "gwei"), // Adjust gas price if needed
            nonce: nonce // Explicitly set the nonce
        });
        console.log('Transaction response:', txResponse);
        console.log('Waiting for transaction to be mined...');
        const receipt = await txResponse.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
        await estimateSendFees(DESTINATION_ENDPOINT_ID, "1000", false, optionsData);
    }
    catch (error) {
        console.error('Error setting enforced options:', error);
    }
}
// Assume this function is part of your setup process and is called when necessary
async function setPeerContracts() {
    try {
        const destinationOFTBytes32 = ethers_1.ethers.utils.hexZeroPad(destinationOftAddress, 32);
        const sourceAdapterBytes32 = ethers_1.ethers.utils.hexZeroPad(sourceAdapterAddress, 32);
        const isAdapterPeerOfOFT = await destinationOFTContract.isPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32); //  SOURCE endpint id
        const isOFTPeerOfAdapter = await sourceAdapterContract.isPeer(DESTINATION_ENDPOINT_ID, destinationOFTBytes32); //  DESTINATION endpoint id
        if (!isAdapterPeerOfOFT || !isOFTPeerOfAdapter) {
            console.log("Pairing...");
            console.log("Pending hereee");
            const txAdapter = await sourceAdapterContract.setPeer(DESTINATION_ENDPOINT_ID, destinationOFTBytes32);
            console.log("Pending hereee");
            await txAdapter.wait();
            console.log("Peered OFT to Adapter");
            const tx = await destinationOFTContract.setPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32);
            await tx.wait();
            console.log("Peered Adapter to OFT");
            console.log(`Adapter to OFT peer status: ${isAdapterPeerOfOFT}`);
            console.log(`OFT to Adapter peer status: ${isOFTPeerOfAdapter}`);
        }
        else {
            console.log("Already paired");
        }
    }
    catch (error) {
        console.error("An error occurred:", error);
    }
}
async function estimateSendFees(dstEid, amountToSend, isBase, encodedOptions) {
    const currentBalance = await whaleERC20Contract.balanceOf(walletSource.address);
    console.log(`Current token balance: ${ethers_1.ethers.utils.formatUnits(currentBalance, 18)}`);
    // Parse the amount to the correct unit
    const approvalAmount = ethers_1.ethers.utils.parseUnits(amountToSend.toString(), 18);
    console.log(`Attempting to approve ${ethers_1.ethers.utils.formatUnits(approvalAmount, 18)} tokens`);
    // Approve the OFT contract to move your tokens on both networks
    const approveTx = await whaleERC20Contract.approve(sourceAdapterAddress, approvalAmount);
    await approveTx.wait(); // Wait for the first approval to complete
    console.log(`Approval transaction hash: ${approveTx.hash}`);
    const _sendParam = {
        dstEid: dstEid,
        to: ethers_1.ethers.utils.hexZeroPad(walletSource.address, 32),
        amountLD: ethers_1.ethers.utils.parseUnits(amountToSend, 18),
        minAmountLD: ethers_1.ethers.utils.parseUnits(amountToSend, 18),
        extraOptions: encodedOptions,
        composeMsg: ethers_1.ethers.utils.toUtf8Bytes(""),
        oftCmd: ethers_1.ethers.utils.toUtf8Bytes("")
    };
    console.log(`Encoded Options being used: ${encodedOptions}`);
    try {
        const adapterContract = new ethers_1.ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
        if (!ethers_1.ethers.utils.isAddress(destinationOftAddress)) {
            throw new Error("Invalid OFT address");
        }
        if (!approvalAmount.gt(0)) {
            throw new Error("Amount to send must be greater than zero");
        }
        const feeEstimate = await adapterContract.quoteSend(_sendParam, false);
        console.log(`Estimated fees: ${ethers_1.ethers.utils.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${ethers_1.ethers.utils.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);
        await sendTokensToDestination(amountToSend, feeEstimate, encodedOptions);
    }
    catch (error) {
        console.error(`Error estimating fees: ${error}`);
    }
}
async function sendTokensToDestination(amountToSend, msgFee, encodedOptions) {
    try {
        // Validate input parameters
        if (!amountToSend || parseFloat(amountToSend) <= 0) {
            throw new Error("Invalid or zero amount to send specified.");
        }
        if (!ethers_1.ethers.utils.isAddress(destinationOftAddress)) {
            throw new Error("Invalid OFT address specified.");
        }
        // Parse the amount to the correct unit
        const approvalAmount = ethers_1.ethers.utils.parseUnits(amountToSend.toString(), 18);
        // Prepare the send parameters
        const sendParam = {
            dstEid: DESTINATION_ENDPOINT_ID,
            to: ethers_1.ethers.utils.hexZeroPad(walletSource.address, 32),
            amountLD: approvalAmount,
            minAmountLD: approvalAmount,
            extraOptions: encodedOptions,
            composeMsg: ethers_1.ethers.utils.toUtf8Bytes(""),
            oftCmd: ethers_1.ethers.utils.toUtf8Bytes("")
        };
        const fee = {
            nativeFee: msgFee.nativeFee, // Assuming this contains only the nativeFee
            lzTokenFee: msgFee.lzTokenFee // Assuming this contains the LZ token fee
        };
        const adapterContract = new ethers_1.ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
        console.log(sendParam);
        console.log(msgFee);
        const refundAddress = walletSource.address; // Assuming refund should go to the sender's wallet address
        // Get and print the user's balance before sending tokens
        const balanceBefore = await signer.getBalance();
        console.log(`Balance before transaction: ${ethers_1.ethers.utils.formatEther(balanceBefore)} ETH`);
        // Sending tokens, passing msgFee as transaction options
        const txResponse = await adapterContract.send(sendParam, fee, refundAddress, // Pass the refund address
        {
            value: msgFee.nativeFee, // Ensure to pass the payable amount if required
            gasLimit: 2300000,
            gasPrice: ethers_1.ethers.utils.parseUnits("17", "gwei")
        });
        console.log(`Transaction Hash: ${txResponse.hash}`);
        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();
        console.log(`    confirmed in block: ${receipt.blockNumber}`);
        // Get and print the user's balance after sending tokens
        const balanceAfter = await signer.getBalance();
        console.log(`Balance after transaction: ${ethers_1.ethers.utils.formatEther(balanceAfter)} ETH`);
        return receipt; // Returning the receipt might be useful for further processing
    }
    catch (error) {
        // Log detailed error message and rethrow or handle appropriately
        console.error('Failed to send tokens:', error);
        throw error; // Rethrowing the error is useful if you want calling functions to handle it
    }
}
// const bip39 = require('bip39');
// const { hdkey } = require('ethereumjs-wallet');
// const fs = require('fs');
// async function createEthereumWallet() {
//     try {
//         // Generate a random mnemonic (uses BIP39)
//         const mnemonic = bip39.generateMnemonic();
//         // Get the seed from the mnemonic
//         const seed = await bip39.mnemonicToSeed(mnemonic);
//         // Create the HD Wallet from the seed
//         const hdWallet = hdkey.fromMasterSeed(seed);
//         // Get the first account using the standard Ethereum HD path
//         const walletHDPath = "m/44'/60'/0'/0/0";
//         const wallet = hdWallet.derivePath(walletHDPath).getWallet();
//         // Get the wallet address
//         const address = `0x${wallet.getAddress().toString('hex')}`;
//         // Get the private key
//         const privateKey = wallet.getPrivateKey().toString('hex');
//         // Output the address, mnemonic, and private key
//         console.log('Wallet Address:', address);
//         console.log('Mnemonic:', mnemonic);
//         console.log('Private Key:', privateKey);
//         // Save to text file
//         const content = `Wallet Address: ${address}\nMnemonic: ${mnemonic}\nPrivate Key: ${privateKey}`;
//         fs.writeFileSync('wallet-info.txt', content);
//         console.log('Wallet information saved to wallet-info.txt');
//         return { address, mnemonic, privateKey };
//     } catch (error) {
//         console.error('Failed to create wallet:', error);
//     }
// }
(async () => {
    try {
        await setPeerContracts();
        await setEnforcedOptions();
        // Estimate send fees
        // await createEthereumWallet();
    }
    catch (error) {
        console.error(`An error occurred: ${error}`);
    }
    // const iface = new Interface(OFT_ABI);
    // // The transaction data that failed
    // const data = '0xc7c7f5b30000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000c06d677a50e8f01105267dfb08401a11d1dfb05b0000000000000000000000000000000000000000000000000000000000009ce10000000000000000000000003b3d39d059c7c4f14c827e4f32793fe8f2f13f3c00000000000000000000000000166bb7f0435c9e717bb450059150000000000000000000000000000000000000166bb7f0435c9e717bb450059150000000000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    // // Decode the transaction data
    // const decoded = iface.parseTransaction({ data });
    // console.log(decoded);
})();
