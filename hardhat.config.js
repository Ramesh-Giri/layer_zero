"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
require("dotenv/config");
require("hardhat-deploy");
require("hardhat-contract-sizer");
require("@nomiclabs/hardhat-ethers");
require("@layerzerolabs/toolbox-hardhat");
const lz_definitions_1 = require("@layerzerolabs/lz-definitions");
// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC;
// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const accounts = MNEMONIC
    ? { mnemonic: MNEMONIC }
    : PRIVATE_KEY
        ? [PRIVATE_KEY]
        : undefined;
if (accounts == null) {
    console.warn('Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.');
}
const config = {
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        ethereum: {
            // the LayerZero Endpoint ID
            eid: lz_definitions_1.EndpointId.ETHEREUM_V2_MAINNET,
            gas: "auto", // You can set this to a specific limit if necessary
            gasPrice: "auto", // You can set this to a specific price if necessary          
            url: 'https://mainnet.infura.io/v3/6ae62b79ee1341898f1ac24796ada458',
            accounts,
        },
        base: {
            // the LayerZero Endpoint ID
            eid: lz_definitions_1.EndpointId.BASE_MAINNET,
            url: 'https://mainnet.base.org',
            accounts,
        },
        bsc: {
            // the LayerZero Endpoint ID
            eid: lz_definitions_1.EndpointId.BSC_MAINNET,
            url: 'https://bsc-dataseed.binance.org/',
            accounts,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
            sepolia: 0
        },
    },
};
exports.default = config;
