import { ethers, } from "ethers";
import dotenv from 'dotenv';
import { EndpointId, } from "@layerzerolabs/lz-definitions";
import { Interface } from "ethers/lib/utils";

const tokenABI = require('./abi/WhaleTokens.json');

//import OptionsBuilder from "../contracts/OptionsBuilder.sol";


import { Options } from '@layerzerolabs/lz-v2-utilities';

// Load environment variables from .env file
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const RPC_URL_SOURCE = 'https://mainnet.base.org';
const RPC_URL_DESTINATION = 'https://mainnet.infura.io/v3/6ae62b79ee1341898f1ac24796ada458';

if (!PRIVATE_KEY) {
    console.error('MNEMONIC not found in environment variables');
    process.exit(1);
}


const SOURCE_ENDPOINT_ID = '30184';  // here base 
const DESTINATION_ENDPOINT_ID = '30101';  // here eth 


/* -------------------------------- ERC 20 contract ( SOURCE:  here: BASE_ SEP)-------------------------------- */

// Using Sepolia network's Infura endpoint
const sourceProvider = new ethers.providers.JsonRpcProvider(RPC_URL_SOURCE);

// Connect to the Ethereum network
// Create a wallet from the mnemonic
const walletSource = new ethers.Wallet(PRIVATE_KEY);

// Connect the wallet to the provider to create a signer
const signer = walletSource.connect(sourceProvider);

const whaleERC20Address = '0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F'; //ERC token address deployed on source
const whaleERC20Contract = new ethers.Contract(whaleERC20Address, tokenABI, signer);


/* -------------------------------- OFT on Base (destination: here: Sepolia) -------------------------------- */
const OFT_ABI = require('../artifacts/contracts/WhaleOFT.sol/WhaleOFT.json').abi;

const destinationProvider = new ethers.providers.JsonRpcProvider(RPC_URL_DESTINATION);
const walletDestination = new ethers.Wallet(PRIVATE_KEY).connect(destinationProvider);


 // TODO://Change this to the OFT contract address on the destination network
const destinationOftAddress = '0x10456F0788Bfba7405C89451bE257b11b490975E';  

const destinationOFTContract = new ethers.Contract(destinationOftAddress, OFT_ABI, walletDestination);


/* -------------------------------- OFT Adapter (SOURCE: here: SEPOLIA)-------------------------------- */

const ADAPTER_ABI = require('../artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json').abi;
const walletAdapter = new ethers.Wallet(PRIVATE_KEY).connect(sourceProvider);

// TODO://
const sourceAdapterAddress = '0xbB35A07481cC10382D486D97EcB7F878Dfba092e';

const sourceAdapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);

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
            gasPrice: ethers.utils.parseUnits("23", "gwei"), // Adjust gas price if needed
            nonce: nonce // Explicitly set the nonce
        });

        console.log('Transaction response:', txResponse);
        console.log('Waiting for transaction to be mined...');
        const receipt = await txResponse.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);


        await estimateSendFees(DESTINATION_ENDPOINT_ID, "200000000", false, optionsData);
    } catch (error) {
        console.error('Error setting enforced options:', error);
    }
}


// Assume this function is part of your setup process and is called when necessary
async function setPeerContracts() {
    try {

        const destinationOFTBytes32 = ethers.utils.hexZeroPad(destinationOftAddress, 32);
        const sourceAdapterBytes32 = ethers.utils.hexZeroPad(sourceAdapterAddress, 32);


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
        }else{
            console.log("Already paired");
        }

    } catch (error) {
        console.error("An error occurred:", error);
    }
}

async function estimateSendFees(dstEid: any, amountToSend: string, isBase: boolean, encodedOptions: any) {

    const currentBalance = await whaleERC20Contract.balanceOf(walletSource.address);
    console.log(`Current token balance: ${ethers.utils.formatUnits(currentBalance, 18)}`);

    // Parse the amount to the correct unit
    const approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);

    console.log(`Attempting to approve ${ethers.utils.formatUnits(approvalAmount, 18)} tokens`);

    // Approve the OFT contract to move your tokens on both networks
    const approveTx = await whaleERC20Contract.approve(sourceAdapterAddress, approvalAmount);
    await approveTx.wait(); // Wait for the first approval to complete

    console.log(`Approval transaction hash: ${approveTx.hash}`);


    const _sendParam = {
        dstEid: dstEid,
        to: ethers.utils.hexZeroPad(walletSource.address, 32),
        amountLD: ethers.utils.parseUnits(amountToSend, 18),
        minAmountLD: ethers.utils.parseUnits(amountToSend, 18),
        extraOptions: encodedOptions,
        composeMsg: ethers.utils.toUtf8Bytes(""),
        oftCmd: ethers.utils.toUtf8Bytes("")
    };

    console.log(`Encoded Options being used: ${encodedOptions}`);


    try {
        const adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);


        if (!ethers.utils.isAddress(destinationOftAddress)) {
            throw new Error("Invalid OFT address");
        }
        if (!approvalAmount.gt(0)) {
            throw new Error("Amount to send must be greater than zero");
        }


        const feeEstimate = await adapterContract.quoteSend(_sendParam, false);


        console.log(`Estimated fees: ${ethers.utils.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${ethers.utils.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);

        await sendTokensToDestination(amountToSend, feeEstimate, encodedOptions);

    } catch (error) {
        console.error(`Error estimating fees: ${error}`);
    }

}

// Uncommit this to send tokens.

async function sendTokensToDestination(amountToSend: any, msgFee: any, encodedOptions: any) {
    try {
        // Validate input parameters
        if (!amountToSend || parseFloat(amountToSend) <= 0) {
            throw new Error("Invalid or zero amount to send specified.");
        }
        if (!ethers.utils.isAddress(destinationOftAddress)) {
            throw new Error("Invalid OFT address specified.");
        }

        // Parse the amount to the correct unit
        const approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);

        // Prepare the send parameters
        const sendParam = {
            dstEid: DESTINATION_ENDPOINT_ID,
            to: ethers.utils.hexZeroPad(walletSource.address, 32),
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

        const adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);

        console.log(sendParam);
        console.log(msgFee);


        const refundAddress = walletSource.address; // Assuming refund should go to the sender's wallet address

                // Get and print the user's balance before sending tokens
                const balanceBefore = await signer.getBalance();
                console.log(`Balance before transaction: ${ethers.utils.formatEther(balanceBefore)} ETH`);
        
        // Sending tokens, passing msgFee as transaction options

        const txResponse = await adapterContract.send(
            sendParam,
            fee,
            refundAddress, // Pass the refund address
            {
                value: msgFee.nativeFee, // Ensure to pass the payable amount if required                
            }
        );


        console.log(`Transaction Hash: ${txResponse.hash}`);

        // Wait for the transaction to be mined
        const receipt = await txResponse.wait();
        console.log(`    confirmed in block: ${receipt.blockNumber}`);


        // Get and print the user's balance after sending tokens
        const balanceAfter = await signer.getBalance();
        console.log(`Balance after transaction: ${ethers.utils.formatEther(balanceAfter)} ETH`);


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

