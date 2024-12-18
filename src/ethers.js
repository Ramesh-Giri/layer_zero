var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var ethers = require("ethers");
var dotenv = require("dotenv");
var EndpointId = require("@layerzerolabs/lz-definitions");
var tokenABI = require('./abi/WhaleTokens.json');
//import OptionsBuilder from "../contracts/OptionsBuilder.sol";
var Options = require("@layerzerolabs/lz-v2-utilities");
// Load environment variables from .env file
dotenv.config();
var PRIVATE_KEY = process.env.PRIVATE_KEY;
var RPC_URL_SOURCE = 'https://mainnet.base.org';
var RPC_URL_DESTINATION = 'https://mainnet.infura.io/v3/6ae62b79ee1341898f1ac24796ada458';
var RPC_URL_DESTINATION_BSC = 'https://bsc-dataseed.binance.org';
if (!PRIVATE_KEY) {
    console.error('NO PRIVATE KEY  not found in environment variables');
    process.exit(1);
}
var SOURCE_ENDPOINT_ID = '30184'; // here base 
var DESTINATION_ENDPOINT_ID = '30101'; // here eth 
var DESTINATION_ENDPOINT_ID_BSC = '30102'; // here BSC 
/* -------------------------------- ERC 20 contract ( SOURCE:  here: BASE_ SEP)-------------------------------- */
// Using Sepolia network's Infura endpoint
var sourceProvider = new ethers.providers.JsonRpcProvider(RPC_URL_SOURCE);
// Connect to the Ethereum network
// Create a wallet from the mnemonic
var walletSource = new ethers.Wallet(PRIVATE_KEY);
// Connect the wallet to the provider to create a signer
var signer = walletSource.connect(sourceProvider);
var whaleERC20Address = '0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F'; //ERC token address deployed on source
var whaleERC20Contract = new ethers.Contract(whaleERC20Address, tokenABI, signer);
/* -------------------------------- OFT on Base () -------------------------------- */
var OFT_ABI = require('../artifacts/contracts/WhaleOFT.sol/WhaleOFT.json').abi;
var destinationProvider = new ethers.providers.JsonRpcProvider(RPC_URL_DESTINATION);
var walletDestination = new ethers.Wallet(PRIVATE_KEY).connect(destinationProvider);
var destinationOftAddress = '0x10456F0788Bfba7405C89451bE257b11b490975E';
var destinationOFTContract = new ethers.Contract(destinationOftAddress, OFT_ABI, walletDestination);
/* -------------------------------- OFT on BSC () -------------------------------- */
var destinationProviderBSC = new ethers.providers.JsonRpcProvider(RPC_URL_DESTINATION_BSC);
var walletDestinationBSC = new ethers.Wallet(PRIVATE_KEY).connect(destinationProviderBSC);
var destinationBscAddress = '0xA8944F431c93D7922555C535eeB7bAd4136A9a52';
var destinationBscContract = new ethers.Contract(destinationBscAddress, OFT_ABI, walletDestinationBSC);
/* -------------------------------- OFT Adapter (SOURCE: here: SEPOLIA)-------------------------------- */
var ADAPTER_ABI = require('../artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json').abi;
var walletAdapter = new ethers.Wallet(PRIVATE_KEY).connect(sourceProvider);
// TODO://
var sourceAdapterAddress = '0xbB35A07481cC10382D486D97EcB7F878Dfba092e';
var sourceAdapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
// Function to Set Enforced Options
// Function to Set Enforced Options
function setEnforcedOptions() {
    return __awaiter(this, void 0, void 0, function () {
        var Options, _options, optionsData, enforcedOptions, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Options = require('@layerzerolabs/lz-v2-utilities').Options;
                    _options = Options.newOptions()
                        .addExecutorLzReceiveOption(1000000, 1);
                    optionsData = _options.toHex();
                    console.log('Enforced options:', optionsData);
                    // Display structured data of options
                    console.log('Options Data:', JSON.stringify({ gasLimit: 1000000, msgValue: 1 }, null, 2));
                    console.log('Fetching the enforced options:');
                    enforcedOptions = [
                        {
                            eid: DESTINATION_ENDPOINT_ID,
                            msgType: 1,
                            options: optionsData
                        },
                        {
                            eid: DESTINATION_ENDPOINT_ID_BSC,
                            msgType: 1,
                            options: optionsData
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // const nonce = await sourceProvider.getTransactionCount(walletSource.address, 'latest'); // Get the current nonce
                    // console.log('Sending transaction with nonce:', nonce);
                    // const txResponse = await sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
                    //     gasLimit: 1500000, // Adjusted gas limit if needed
                    //     gasPrice: ethers.utils.parseUnits("23", "gwei"), // Adjust gas price if needed
                    //     nonce: nonce // Explicitly set the nonce
                    // });
                    // console.log('Transaction response:', txResponse);
                    // console.log('Waiting for transaction to be mined...');
                    // const receipt = await txResponse.wait();
                    // console.log('Transaction confirmed in block:', receipt.blockNumber);
                    // await estimateSendFees(DESTINATION_ENDPOINT_ID, "2000", false, optionsData);
                    //sending to bsc
                    return [4 /*yield*/, estimateSendFees(DESTINATION_ENDPOINT_ID_BSC, "2000", false, optionsData)];
                case 2:
                    // const nonce = await sourceProvider.getTransactionCount(walletSource.address, 'latest'); // Get the current nonce
                    // console.log('Sending transaction with nonce:', nonce);
                    // const txResponse = await sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
                    //     gasLimit: 1500000, // Adjusted gas limit if needed
                    //     gasPrice: ethers.utils.parseUnits("23", "gwei"), // Adjust gas price if needed
                    //     nonce: nonce // Explicitly set the nonce
                    // });
                    // console.log('Transaction response:', txResponse);
                    // console.log('Waiting for transaction to be mined...');
                    // const receipt = await txResponse.wait();
                    // console.log('Transaction confirmed in block:', receipt.blockNumber);
                    // await estimateSendFees(DESTINATION_ENDPOINT_ID, "2000", false, optionsData);
                    //sending to bsc
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error setting enforced options:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function setPeerContracts() {
    return __awaiter(this, void 0, void 0, function () {
        var sourceAdapterBytes32, destinationOFTBytes32, destinationBscOFTBytes32, isAdapterPeerOfOFT, isOFTPeerOfAdapter, txAdapter, tx, isAdapterPeerOfBscOFT, isBscOFTPeerOfAdapter, txResponse, txBscOFTToAdapter, error_2, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 19, , 20]);
                    sourceAdapterBytes32 = ethers.utils.hexZeroPad(sourceAdapterAddress, 32);
                    destinationOFTBytes32 = ethers.utils.hexZeroPad(destinationOftAddress, 32);
                    destinationBscOFTBytes32 = ethers.utils.hexZeroPad(destinationBscAddress, 32);
                    return [4 /*yield*/, destinationOFTContract.isPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32)];
                case 1:
                    isAdapterPeerOfOFT = _a.sent();
                    return [4 /*yield*/, sourceAdapterContract.isPeer(DESTINATION_ENDPOINT_ID, destinationOFTBytes32)];
                case 2:
                    isOFTPeerOfAdapter = _a.sent();
                    if (!(!isAdapterPeerOfOFT || !isOFTPeerOfAdapter)) return [3 /*break*/, 7];
                    console.log("Pairing...");
                    return [4 /*yield*/, sourceAdapterContract.setPeer(DESTINATION_ENDPOINT_ID, destinationOFTBytes32)];
                case 3:
                    txAdapter = _a.sent();
                    return [4 /*yield*/, txAdapter.wait()];
                case 4:
                    _a.sent();
                    console.log("Peered OFT to Adapter");
                    return [4 /*yield*/, destinationOFTContract.setPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32)];
                case 5:
                    tx = _a.sent();
                    return [4 /*yield*/, tx.wait()];
                case 6:
                    _a.sent();
                    console.log("Peered Adapter to OFT");
                    return [3 /*break*/, 8];
                case 7:
                    console.log("Already paired OFT to Adapter");
                    _a.label = 8;
                case 8:
                    _a.trys.push([8, 17, , 18]);
                    return [4 /*yield*/, destinationBscContract.isPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32)];
                case 9:
                    isAdapterPeerOfBscOFT = _a.sent();
                    return [4 /*yield*/, sourceAdapterContract.isPeer(DESTINATION_ENDPOINT_ID_BSC, destinationBscOFTBytes32)];
                case 10:
                    isBscOFTPeerOfAdapter = _a.sent();
                    if (!(!isAdapterPeerOfBscOFT || !isBscOFTPeerOfAdapter)) return [3 /*break*/, 15];
                    console.log("Attempting to pair Adapter to BSC OFT...");
                    return [4 /*yield*/, sourceAdapterContract.setPeer(DESTINATION_ENDPOINT_ID_BSC, destinationBscOFTBytes32)];
                case 11:
                    txResponse = _a.sent();
                    return [4 /*yield*/, txResponse.wait()];
                case 12:
                    _a.sent();
                    console.log("Transaction Hash (Adapter to BSC OFT): ".concat(txResponse.hash));
                    console.log("Adapter to BSC OFT paired successfully.");
                    return [4 /*yield*/, destinationBscContract.setPeer(SOURCE_ENDPOINT_ID, sourceAdapterBytes32)];
                case 13:
                    txBscOFTToAdapter = _a.sent();
                    console.log("Transaction Hash (BSC OFT to Adapter): ".concat(txBscOFTToAdapter.hash));
                    return [4 /*yield*/, txBscOFTToAdapter.wait()];
                case 14:
                    _a.sent();
                    console.log("BSC OFT to Adapter paired successfully.");
                    return [3 /*break*/, 16];
                case 15:
                    console.log("Already paired Adapter to BSC OFT");
                    _a.label = 16;
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_2 = _a.sent();
                    console.error("An error occurred in the pairing process:", error_2);
                    return [3 /*break*/, 18];
                case 18: return [3 /*break*/, 20];
                case 19:
                    error_3 = _a.sent();
                    console.error("An error occurred:", error_3);
                    return [3 /*break*/, 20];
                case 20: return [2 /*return*/];
            }
        });
    });
}
function estimateSendFees(dstEid, amountToSend, isBase, encodedOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var currentBalance, approvalAmount, approveTx, _sendParam, adapterContract, feeEstimate, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, whaleERC20Contract.balanceOf(walletSource.address)];
                case 1:
                    currentBalance = _a.sent();
                    console.log("Current token balance: ".concat(ethers.utils.formatUnits(currentBalance, 18)));
                    approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);
                    console.log("Attempting to approve ".concat(ethers.utils.formatUnits(approvalAmount, 18), " tokens"));
                    return [4 /*yield*/, whaleERC20Contract.approve(sourceAdapterAddress, approvalAmount)];
                case 2:
                    approveTx = _a.sent();
                    return [4 /*yield*/, approveTx.wait()];
                case 3:
                    _a.sent(); // Wait for the first approval to complete
                    console.log("Approval transaction hash: ".concat(approveTx.hash));
                    _sendParam = {
                        dstEid: dstEid,
                        to: ethers.utils.hexZeroPad(walletSource.address, 32),
                        amountLD: ethers.utils.parseUnits(amountToSend, 18),
                        minAmountLD: ethers.utils.parseUnits(amountToSend, 18),
                        extraOptions: encodedOptions,
                        composeMsg: ethers.utils.toUtf8Bytes(""),
                        oftCmd: ethers.utils.toUtf8Bytes("")
                    };
                    console.log("Encoded Options being used: ".concat(encodedOptions));
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 10, , 11]);
                    adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
                    if (!ethers.utils.isAddress(destinationOftAddress)) {
                        throw new Error("Invalid OFT address");
                    }
                    if (!approvalAmount.gt(0)) {
                        throw new Error("Amount to send must be greater than zero");
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 8, , 9]);
                    return [4 /*yield*/, adapterContract.quoteSend(_sendParam, false)];
                case 6:
                    feeEstimate = _a.sent();
                    console.log("Estimated fees: ".concat(ethers.utils.formatUnits(feeEstimate.nativeFee, "ether"), " ETH, ").concat(ethers.utils.formatUnits(feeEstimate.lzTokenFee, 18), " LZT"));
                    return [4 /*yield*/, sendTokensToDestination(amountToSend, feeEstimate, encodedOptions)];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _a.sent();
                    console.error("Error geting quote fees: ".concat(error_4));
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_5 = _a.sent();
                    console.error("Error estimating fees: ".concat(error_5));
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
// Uncommit this to send tokens.
function sendTokensToDestination(amountToSend, msgFee, encodedOptions) {
    return __awaiter(this, void 0, void 0, function () {
        var approvalAmount, sendParam, fee, adapterContract, refundAddress, balanceBefore, txResponse, receipt, balanceAfter, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    // Validate input parameters
                    if (!amountToSend || parseFloat(amountToSend) <= 0) {
                        throw new Error("Invalid or zero amount to send specified.");
                    }
                    if (!ethers.utils.isAddress(destinationOftAddress)) {
                        throw new Error("Invalid OFT address specified.");
                    }
                    approvalAmount = ethers.utils.parseUnits(amountToSend.toString(), 18);
                    sendParam = {
                        dstEid: DESTINATION_ENDPOINT_ID,
                        to: ethers.utils.hexZeroPad(walletSource.address, 32),
                        amountLD: approvalAmount,
                        minAmountLD: approvalAmount,
                        extraOptions: encodedOptions,
                        composeMsg: ethers.utils.toUtf8Bytes(""),
                        oftCmd: ethers.utils.toUtf8Bytes("")
                    };
                    fee = {
                        nativeFee: msgFee.nativeFee, // Assuming this contains only the nativeFee
                        lzTokenFee: msgFee.lzTokenFee // Assuming this contains the LZ token fee
                    };
                    adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, walletAdapter);
                    console.log(sendParam);
                    console.log(msgFee);
                    refundAddress = walletSource.address;
                    return [4 /*yield*/, signer.getBalance()];
                case 1:
                    balanceBefore = _a.sent();
                    console.log("Balance before transaction: ".concat(ethers.utils.formatEther(balanceBefore), " ETH"));
                    return [4 /*yield*/, adapterContract.send(sendParam, fee, refundAddress, // Pass the refund address
                        {
                            value: msgFee.nativeFee, // Ensure to pass the payable amount if required                
                        })];
                case 2:
                    txResponse = _a.sent();
                    console.log("Transaction Hash: ".concat(txResponse.hash));
                    return [4 /*yield*/, txResponse.wait()];
                case 3:
                    receipt = _a.sent();
                    console.log("    confirmed in block: ".concat(receipt.blockNumber));
                    return [4 /*yield*/, signer.getBalance()];
                case 4:
                    balanceAfter = _a.sent();
                    console.log("Balance after transaction: ".concat(ethers.utils.formatEther(balanceAfter), " ETH"));
                    return [2 /*return*/, receipt]; // Returning the receipt might be useful for further processing
                case 5:
                    error_6 = _a.sent();
                    // Log detailed error message and rethrow or handle appropriately
                    console.error('Failed to send tokens:', error_6);
                    throw error_6; // Rethrowing the error is useful if you want calling functions to handle it
                case 6: return [2 /*return*/];
            }
        });
    });
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
(function () { return __awaiter(_this, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, setPeerContracts()];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error("An error occurred: ".concat(error_7));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
