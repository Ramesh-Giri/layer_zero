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
var ethers_1 = require("ethers");
var networks_1 = require("./config/networks");
var express_1 = require("express");
var functions_1 = require("./utils/functions");
function initializeNetworks(env, signer) {
    var selectedConfig = networks_1.default[env];
    return Object.keys(selectedConfig).map(function (networkKey) {
        var network = selectedConfig[networkKey];
        var provider = signer.provider;
        return {
            networkKey: networkKey,
            provider: provider,
            wallet: signer, // Use the provided signer instead of a wallet from a private key
            oftAddress: network.oftAddress,
            adapterAddress: network.adapterAddress,
            endpointId: network.endpointId,
        };
    });
}
// Set up Express
var app = (0, express_1.default)();
app.use(function (req, res, next) {
    console.log("Request received for ".concat(req.method, " ").concat(req.url));
    res.status(404).send('Not Found');
});
app.post('/estimate-gas', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, endpointId, amount, isBaseNetwork, optionsData, walletProviderUrl, provider, signer, networks, parsedAmount, estimatedGas, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, endpointId = _a.endpointId, amount = _a.amount, isBaseNetwork = _a.isBaseNetwork, optionsData = _a.optionsData, walletProviderUrl = _a.walletProviderUrl;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                provider = new ethers_1.ethers.JsonRpcProvider(walletProviderUrl);
                return [4 /*yield*/, provider.getSigner()];
            case 2:
                signer = _b.sent();
                networks = initializeNetworks('mainnet', signer);
                parsedAmount = ethers_1.ethers.parseUnits(amount, 18);
                return [4 /*yield*/, (0, functions_1.estimateSendFees)(endpointId, parsedAmount, isBaseNetwork, optionsData, signer)];
            case 3:
                estimatedGas = _b.sent();
                res.json({ estimatedGas: estimatedGas });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error("Error estimating gas: ".concat(error_1));
                res.status(500).json({ error: 'Failed to estimate gas' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var PORT = process.env.PORT || 3000;
try {
    app.listen(PORT, function () {
        console.log("Server running on port ".concat(PORT));
    });
}
catch (error) {
    console.error("Error starting server:", error);
}
