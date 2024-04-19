import { ethers, } from "ethers";
import dotenv from 'dotenv';
import { EndpointId, } from "@layerzerolabs/lz-definitions";
import { Interface } from "ethers/lib/utils";

const tokenABI = require('./abi/ApuTokens.json').abi;

//import OptionsBuilder from "../contracts/OptionsBuilder.sol";


import { Options } from '@layerzerolabs/lz-v2-utilities';

// Load environment variables from .env file
dotenv.config();

const MNEMONIC = process.env.MNEMONIC;
const RPC_URL = 'https://sepolia.base.org';


if (!MNEMONIC) {
    console.error('MNEMONIC not found in environment variables');
    process.exit(1);
}


/* -------------------------------- ERC 20 contract (SOURCE: SEPOLIA)-------------------------------- */

// Using Sepolia network's Infura endpoint
const sepoliaProvider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/6ae62b79ee1341898f1ac24796ada458');

// Connect to the Ethereum network
// Create a wallet from the mnemonic
const wallet = ethers.Wallet.fromMnemonic(MNEMONIC);

// Connect the wallet to the provider to create a si    gner
const signer = wallet.connect(sepoliaProvider);

const apuERC20Address = '0xD0e2d531762C4b8E9228aD28e87dbA20595Cc987'; //ERC token address deployed on Sepolia
const apuERC20Contract = new ethers.Contract(apuERC20Address, tokenABI, signer);




/* -------------------------------- OFT on Base (destination: BASE) -------------------------------- */
const OFT_ABI = require('../artifacts/contracts/ApuOFT.sol/ApuOFT.json').abi;
const providerBase = new ethers.providers.JsonRpcProvider(RPC_URL);
const walletBase = ethers.Wallet.fromMnemonic(MNEMONIC).connect(providerBase);

const apuOFTAddress = '0x6Bd2CfE7050969631e90869d18dbdaDc765A7468';

const oftContract = new ethers.Contract(apuOFTAddress, OFT_ABI, walletBase);

const userAddress = "0x3b3d39D059C7C4F14C827E4f32793fe8f2F13F3C";


/* -------------------------------- OFT Adapter (SOURCE: SEPOLIA)-------------------------------- */

const ADAPTER_ABI = require('../artifacts/contracts/ApuAdapter.sol/ApuAdapter.json').abi;
const walletAdapter = ethers.Wallet.fromMnemonic(MNEMONIC).connect(sepoliaProvider);

const adapterAddress = '0x4894503c0261493b9DE02b207b6CbD9db7974F52';

const adapterContract = new ethers.Contract(adapterAddress, ADAPTER_ABI, walletAdapter);

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
            eid: 40245,
            msgType: 1,
            options: optionsData
        }
    ];

    try {
        const nonce = await sepoliaProvider.getTransactionCount(wallet.address, 'latest'); // Get the current nonce

        console.log('Sending transaction with nonce:', nonce);
        const txResponse = await adapterContract.setEnforcedOptions(enforcedOptions, {
            gasLimit: 1000000, // Adjusted gas limit if needed
            gasPrice: ethers.utils.parseUnits("23", "gwei"), // Adjust gas price if needed
            nonce: nonce // Explicitly set the nonce
        });

        console.log('Transaction response:', txResponse);
        console.log('Waiting for transaction to be mined...');
        const receipt = await txResponse.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);


        await estimateSendFees(40245, "1000", false, optionsData);
    } catch (error) {
        console.error('Error setting enforced options:', error);
    }
}


// Assume this function is part of your setup process and is called when necessary
async function setPeerContracts() {
    try {

        const OFTAddressBytes32 = ethers.utils.hexZeroPad(apuOFTAddress, 32);
        const adapterAddressBytes32 = ethers.utils.hexZeroPad(adapterAddress, 32);


        const isAdapterPeerOfOFT = await oftContract.isPeer(40161, adapterAddressBytes32); // 40161 is sepolia endpint id
        const isOFTPeerOfAdapter = await adapterContract.isPeer(40245, OFTAddressBytes32); // 40245 is base endpoint id

        if (!isAdapterPeerOfOFT || !isOFTPeerOfAdapter) {
            console.log("Pairing...");

            console.log("Pending hereee");
            const txAdapter = await adapterContract.setPeer(40245, OFTAddressBytes32);
            console.log("Pending hereee");
            await txAdapter.wait();
            console.log("Peered OFT to Adapter");

            const tx = await oftContract.setPeer(40161, adapterAddressBytes32);
            await tx.wait();
            console.log("Peered Adapter to OFT");


            console.log(`Adapter to OFT peer status: ${isAdapterPeerOfOFT}`);


            console.log(`OFT to Adapter peer status: ${isOFTPeerOfAdapter}`);
        }else{
            console.log("Already paired");
        }

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function estimateSendFees(dstEid: any, amountToSend: string, isBase: boolean, encodedOptions: any) {

    const currentBalance = await apuERC20Contract.balanceOf(wallet.address);
    console.log(`Current token balance: ${ethers.utils.formatUnits(currentBalance, 18)}`);

    // Parse the amount to the correct unit
    const approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);

    console.log(`Attempting to approve ${ethers.utils.formatUnits(approvalAmount, 18)} tokens`);

    // Approve the OFT contract to move your tokens on both networks
    const approveTx = await apuERC20Contract.approve(adapterAddress, approvalAmount);
    await approveTx.wait(); // Wait for the first approval to complete

    console.log(`Approval transaction hash: ${approveTx.hash}`);


    const _sendParam = {
        dstEid: dstEid,
        to: ethers.utils.hexZeroPad(wallet.address, 32),
        amountLD: ethers.utils.parseUnits(amountToSend, 18),
        minAmountLD: ethers.utils.parseUnits(amountToSend, 18),
        extraOptions: encodedOptions,
        composeMsg: ethers.utils.toUtf8Bytes(""),
        oftCmd: ethers.utils.toUtf8Bytes("")
    };

    console.log(`Encoded Options being used: ${encodedOptions}`);


    try {
        const adapterContract = new ethers.Contract(adapterAddress, ADAPTER_ABI, walletAdapter);


        if (!ethers.utils.isAddress(apuOFTAddress)) {
            throw new Error("Invalid OFT address");
        }
        if (!approvalAmount.gt(0)) {
            throw new Error("Amount to send must be greater than zero");
        }


        const feeEstimate = await adapterContract.quoteSend(_sendParam, false);


        console.log(`Estimated fees: ${ethers.utils.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${ethers.utils.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);

        await sendTokensToBase(amountToSend, feeEstimate, encodedOptions);

    } catch (error) {
        console.error(`Error estimating fees: ${error}`);
    }

}

async function sendTokensToBase(amountToSend: any, msgFee: any, encodedOptions: any) {
    try {
        // Validate input parameters
        if (!amountToSend || parseFloat(amountToSend) <= 0) {
            throw new Error("Invalid or zero amount to send specified.");
        }
        if (!ethers.utils.isAddress(apuOFTAddress)) {
            throw new Error("Invalid OFT address specified.");
        }

        // Parse the amount to the correct unit
        const approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);

        // Prepare the send parameters
        const sendParam = {
            dstEid: 40245,
            to: ethers.utils.hexZeroPad(wallet.address, 32),
            amountLD: approvalAmount,
            minAmountLD: approvalAmount,
            extraOptions: encodedOptions,
            composeMsg: ethers.utils.toUtf8Bytes(""),
            oftCmd: ethers.utils.toUtf8Bytes("")
        };

        const fee = {
            nativeFee: msgFee.nativeFee, // Assuming this contains only the nativeFee
            lzTokenFee: msgFee.lzTokenFee // Assuming this contains the LZ token fee
        };

        const adapterContract = new ethers.Contract(adapterAddress, ADAPTER_ABI, walletAdapter);

        console.log(sendParam);
        console.log(msgFee);


        const refundAddress = wallet.address; // Assuming refund should go to the sender's wallet address


        // Sending tokens, passing msgFee as transaction options

        const txResponse = await adapterContract.send(
            sendParam,
            fee,
            refundAddress, // Pass the refund address
            {
                value: msgFee.nativeFee, // Ensure to pass the payable amount if required
                gasLimit: 2000000,
                gasPrice: ethers.utils.parseUnits("17", "gwei")
            }
        );


        console.log(`Transaction Hash: ${txResponse.hash}`);

        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();
        console.log(`    confirmed in block: ${receipt.blockNumber}`);

        return receipt; // Returning the receipt might be useful for further processing

    } catch (error) {
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
    } catch (error) {
        console.error(`An error occurred: ${error}`);
    }



    // const iface = new Interface(OFT_ABI);

    // // The transaction data that failed
    // const data = '0xc7c7f5b30000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000016345785d8a00000000000000000000000000000000000000000000000000008ac7230489e80000000000000000000000000000c06d677a50e8f01105267dfb08401a11d1dfb05b0000000000000000000000000000000000000000000000000000000000009ce10000000000000000000000003b3d39d059c7c4f14c827e4f32793fe8f2f13f3c00000000000000000000000000166bb7f0435c9e717bb450059150000000000000000000000000000000000000166bb7f0435c9e717bb450059150000000000000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

    // // Decode the transaction data
    // const decoded = iface.parseTransaction({ data });



    // console.log(decoded);

})();

