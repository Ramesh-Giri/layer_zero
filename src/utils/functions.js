"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTokensToDestination = exports.estimateSendFees = exports.setEnforcedOptions = exports.setPeerContracts = void 0;
var networks_1 = require("../config/networks");
var ethers_1 = require("ethers");
function setPeerContracts(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var _i, networks_2, sourceNetwork, sourceAdapterBytes32, sourceOFTContract, _c, networks_3, destinationNetwork, destinationOFTBytes32, destinationAdapterContract, isAdapterPeerOfOFT, isOFTPeerOfAdapter, txAdapter, txOFT;
        var networks = _b.networks, signer = _b.signer;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _i = 0, networks_2 = networks;
                    _d.label = 1;
                case 1:
                    if (!(_i < networks_2.length)) return [3 /*break*/, 12];
                    sourceNetwork = networks_2[_i];
                    sourceAdapterBytes32 = ethers_1.ethers.zeroPadValue(sourceNetwork.adapterAddress, 32);
                    sourceOFTContract = new ethers_1.ethers.Contract(sourceNetwork.oftAddress, require("../../../whale_token/artifacts/contracts/WhaleOFT.sol/WhaleOFT.json").abi, signer.connect(sourceNetwork.provider));
                    _c = 0, networks_3 = networks;
                    _d.label = 2;
                case 2:
                    if (!(_c < networks_3.length)) return [3 /*break*/, 11];
                    destinationNetwork = networks_3[_c];
                    if (sourceNetwork.networkKey === destinationNetwork.networkKey)
                        return [3 /*break*/, 10];
                    destinationOFTBytes32 = ethers_1.ethers.zeroPadValue(destinationNetwork.oftAddress, 32);
                    destinationAdapterContract = new ethers_1.ethers.Contract(destinationNetwork.adapterAddress, require("../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json").abi, signer.connect(destinationNetwork.provider));
                    return [4 /*yield*/, sourceOFTContract.isPeer(sourceNetwork.endpointId, destinationOFTBytes32)];
                case 3:
                    isAdapterPeerOfOFT = _d.sent();
                    return [4 /*yield*/, destinationAdapterContract.isPeer(destinationNetwork.endpointId, sourceAdapterBytes32)];
                case 4:
                    isOFTPeerOfAdapter = _d.sent();
                    if (!(!isAdapterPeerOfOFT || !isOFTPeerOfAdapter)) return [3 /*break*/, 9];
                    console.log("Pairing ".concat(sourceNetwork.networkKey, " Adapter to ").concat(destinationNetwork.networkKey, " OFT..."));
                    return [4 /*yield*/, sourceOFTContract.setPeer(destinationNetwork.endpointId, destinationOFTBytes32)];
                case 5:
                    txAdapter = _d.sent();
                    return [4 /*yield*/, txAdapter.wait()];
                case 6:
                    _d.sent();
                    return [4 /*yield*/, destinationAdapterContract.setPeer(sourceNetwork.endpointId, sourceAdapterBytes32)];
                case 7:
                    txOFT = _d.sent();
                    return [4 /*yield*/, txOFT.wait()];
                case 8:
                    _d.sent();
                    return [3 /*break*/, 10];
                case 9:
                    console.log("".concat(sourceNetwork.networkKey, " Adapter and ").concat(destinationNetwork.networkKey, " OFT are already paired."));
                    _d.label = 10;
                case 10:
                    _c++;
                    return [3 /*break*/, 2];
                case 11:
                    _i++;
                    return [3 /*break*/, 1];
                case 12: return [2 /*return*/];
            }
        });
    });
}
exports.setPeerContracts = setPeerContracts;
function setEnforcedOptions(signer) {
    return __awaiter(this, void 0, void 0, function () {
        var Options, _options, optionsData, enforcedOptions, sourceNetwork, sourceAdapterContract, nonce, txResponse, receipt, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!signer || !signer.provider) {
                        throw new Error("Invalid signer or provider. Please ensure the signer is connected.");
                    }
                    Options = require('@layerzerolabs/lz-v2-utilities').Options;
                    _options = Options.newOptions().addExecutorLzReceiveOption(1000000, 1);
                    optionsData = _options.toHex();
                    enforcedOptions = [
                        {
                            eid: networks_1.default.mainnet.ethereum.endpointId,
                            msgType: 1,
                            options: optionsData,
                        }
                    ];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    sourceNetwork = networks_1.default.mainnet.base;
                    sourceAdapterContract = new ethers_1.ethers.Contract(sourceNetwork.adapterAddress, require("../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json").abi, signer);
                    return [4 /*yield*/, signer.getNonce('latest')];
                case 2:
                    nonce = _a.sent();
                    return [4 /*yield*/, sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
                            gasLimit: 1000000, // Adjusted gas limit if needed
                            gasPrice: ethers_1.ethers.parseUnits("23", "gwei"), // Gas price in gwei
                            nonce: nonce,
                        })];
                case 3:
                    txResponse = _a.sent();
                    return [4 /*yield*/, txResponse.wait()];
                case 4:
                    receipt = _a.sent();
                    console.log('Transaction confirmed in block:', receipt.blockNumber);
                    return [2 /*return*/, optionsData];
                case 5:
                    error_1 = _a.sent();
                    console.error('Error setting enforced options:', error_1);
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.setEnforcedOptions = setEnforcedOptions;
function estimateSendFees(dstEid, amountToSend, isBase, encodedOptions, signer) {
    return __awaiter(this, void 0, void 0, function () {
        var network, provider, whaleERC20Contract, currentBalance, _a, _b, approvalAmount, approveTx, _sendParam, _c, _d, adapterContract, feeEstimate, error_2;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    network = networks_1.default.mainnet.base;
                    provider = signer.provider;
                    whaleERC20Contract = new ethers_1.ethers.Contract(network.oftAddress, require('../abi/WhaleTokens.json'), signer.connect(provider));
                    _b = (_a = whaleERC20Contract).balanceOf;
                    return [4 /*yield*/, signer.getAddress()];
                case 1: return [4 /*yield*/, _b.apply(_a, [_f.sent()])];
                case 2:
                    currentBalance = _f.sent();
                    console.log("Current token balance: ".concat(ethers_1.ethers.formatUnits(currentBalance, 18)));
                    approvalAmount = amountToSend;
                    return [4 /*yield*/, whaleERC20Contract.approve(network.adapterAddress, approvalAmount)];
                case 3:
                    approveTx = _f.sent();
                    return [4 /*yield*/, approveTx.wait()];
                case 4:
                    _f.sent();
                    _e = {
                        dstEid: dstEid
                    };
                    _d = (_c = ethers_1.ethers).zeroPadValue;
                    return [4 /*yield*/, signer.getAddress()];
                case 5:
                    _sendParam = (_e.to = _d.apply(_c, [_f.sent(), 32]),
                        _e.amountLD = approvalAmount,
                        _e.minAmountLD = approvalAmount,
                        _e.extraOptions = encodedOptions,
                        _e.composeMsg = ethers_1.ethers.toUtf8Bytes(""),
                        _e.oftCmd = ethers_1.ethers.toUtf8Bytes(""),
                        _e);
                    _f.label = 6;
                case 6:
                    _f.trys.push([6, 8, , 9]);
                    adapterContract = new ethers_1.ethers.Contract(network.adapterAddress, require("../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json").abi, signer.connect(provider));
                    return [4 /*yield*/, adapterContract.quoteSend(_sendParam, false)];
                case 7:
                    feeEstimate = _f.sent();
                    console.log("Estimated fees: ".concat(ethers_1.ethers.formatUnits(feeEstimate.nativeFee, "ether"), " ETH, ").concat(ethers_1.ethers.formatUnits(feeEstimate.lzTokenFee, 18), " LZT"));
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _f.sent();
                    console.error("Error estimating fees: ".concat(error_2));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.estimateSendFees = estimateSendFees;
function sendTokensToDestination(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var approvalAmount, sendParam, _c, _d, adapterContract, balanceBefore, _e, _f, _g, gasEstimate, _h, _j, _k, gasLimitWithBuffer, txResponse, _l, _m, _o, receipt, balanceAfter, _p, _q, _r, error_3;
        var _s;
        var _t, _u;
        var amountToSend = _b.amountToSend, msgFee = _b.msgFee, encodedOptions = _b.encodedOptions, signer = _b.signer, destinationOftAddress = _b.destinationOftAddress, sourceAdapterAddress = _b.sourceAdapterAddress, ADAPTER_ABI = _b.ADAPTER_ABI, DESTINATION_ENDPOINT_ID = _b.DESTINATION_ENDPOINT_ID;
        return __generator(this, function (_v) {
            switch (_v.label) {
                case 0:
                    _v.trys.push([0, 15, , 16]);
                    // Validate input parameters
                    if (!amountToSend || parseFloat(amountToSend.toString()) <= 0) {
                        throw new Error("Invalid or zero amount to send specified.");
                    }
                    if (!ethers_1.ethers.isAddress(destinationOftAddress)) {
                        throw new Error("Invalid OFT address specified.");
                    }
                    approvalAmount = ethers_1.ethers.parseUnits(amountToSend.toString(), 18);
                    _s = {
                        dstEid: DESTINATION_ENDPOINT_ID
                    };
                    _d = (_c = ethers_1.ethers).zeroPadValue;
                    return [4 /*yield*/, signer.getAddress()];
                case 1:
                    sendParam = (_s.to = _d.apply(_c, [_v.sent(), 32]),
                        _s.amountLD = approvalAmount,
                        _s.minAmountLD = approvalAmount,
                        _s.extraOptions = encodedOptions,
                        _s.composeMsg = ethers_1.ethers.toUtf8Bytes(""),
                        _s.oftCmd = ethers_1.ethers.toUtf8Bytes(""),
                        _s);
                    adapterContract = new ethers_1.ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, signer);
                    if (!((_t = signer.provider) === null || _t === void 0)) return [3 /*break*/, 2];
                    _e = void 0;
                    return [3 /*break*/, 4];
                case 2:
                    _g = (_f = _t).getBalance;
                    return [4 /*yield*/, signer.getAddress()];
                case 3:
                    _e = _g.apply(_f, [_v.sent()]);
                    _v.label = 4;
                case 4: return [4 /*yield*/, (_e)];
                case 5:
                    balanceBefore = _v.sent();
                    console.log("Balance before transaction: ".concat(ethers_1.ethers.formatUnits(balanceBefore, "ether"), " ETH"));
                    _j = (_h = adapterContract.estimateGas).send;
                    _k = [sendParam,
                        msgFee];
                    return [4 /*yield*/, signer.getAddress()];
                case 6: return [4 /*yield*/, _j.apply(_h, _k.concat([_v.sent(), { value: msgFee.nativeFee }]))];
                case 7:
                    gasEstimate = _v.sent();
                    console.log("Estimated Gas: ".concat(gasEstimate.toString()));
                    gasLimitWithBuffer = BigInt(gasEstimate.toString()) + 10000n;
                    _m = (_l = adapterContract).send;
                    _o = [sendParam,
                        msgFee];
                    return [4 /*yield*/, signer.getAddress()];
                case 8: return [4 /*yield*/, _m.apply(_l, _o.concat([_v.sent(), {
                            gasLimit: gasLimitWithBuffer, // Add buffer as BigInt
                            value: msgFee.nativeFee, // Ensure to pass the payable amount if required                
                        }]))];
                case 9:
                    txResponse = _v.sent();
                    console.log("Transaction Hash: ".concat(txResponse.hash));
                    return [4 /*yield*/, txResponse.wait()];
                case 10:
                    receipt = _v.sent();
                    console.log("Transaction confirmed in block: ".concat(receipt.blockNumber));
                    if (!((_u = signer.provider) === null || _u === void 0)) return [3 /*break*/, 11];
                    _p = void 0;
                    return [3 /*break*/, 13];
                case 11:
                    _r = (_q = _u).getBalance;
                    return [4 /*yield*/, signer.getAddress()];
                case 12:
                    _p = _r.apply(_q, [_v.sent()]);
                    _v.label = 13;
                case 13: return [4 /*yield*/, (_p)];
                case 14:
                    balanceAfter = _v.sent();
                    console.log("Balance after transaction: ".concat(ethers_1.ethers.formatUnits(balanceAfter, "ether"), " ETH"));
                    return [2 /*return*/, receipt]; // Returning the receipt might be useful for further processing
                case 15:
                    error_3 = _v.sent();
                    // Log detailed error message and rethrow or handle appropriately
                    console.error('Failed to send tokens:', error_3);
                    throw error_3; // Rethrowing the error is useful if you want calling functions to handle it
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.sendTokensToDestination = sendTokensToDestination;
