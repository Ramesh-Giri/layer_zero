"use strict";
// src/config/networks.ts
Object.defineProperty(exports, "__esModule", { value: true });
var mainnetConfig = {
    base: {
        rpcUrl: 'https://mainnet.base.org',
        endpointId: '30184',
        oftAddress: '0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F',
        adapterAddress: '0xbB35A07481cC10382D486D97EcB7F878Dfba092e'
    },
    ethereum: {
        rpcUrl: 'https://mainnet.infura.io/v3/6ae62b79ee1341898f1ac24796ada458',
        endpointId: '30101',
        oftAddress: '0x10456F0788Bfba7405C89451bE257b11b490975E',
        adapterAddress: '0xbB35A07481cC10382D486D97EcB7F878Dfba092e'
    },
    bsc: {
        rpcUrl: 'https://bsc-dataseed.binance.org/',
        endpointId: '102',
        oftAddress: '0x7F73A8884Ed3E7bAd79F2f949a1E29F7c0f832Bf',
        adapterAddress: '0xbB35A07481cC10382D486D97EcB7F878Dfba092e'
    }
};
var testnetConfig = {
    base: {
        rpcUrl: 'https://goerli.base.org', // Base Goerli Testnet
        endpointId: '30184', // Update with the correct endpoint ID for Base Goerli if available
        oftAddress: '0xYourBaseGoerliOFTAddress', // Replace with your deployed OFT contract address on Base Goerli
        adapterAddress: '0xYourBaseGoerliAdapterAddress' // Replace with your deployed Adapter contract address on Base Goerli
    },
    ethereum: {
        rpcUrl: 'https://goerli.infura.io/v3/6ae62b79ee1341898f1ac24796ada458', // Goerli Testnet
        endpointId: '10121', // Goerli endpoint ID for LayerZero
        oftAddress: '0xYourGoerliOFTAddress', // Replace with your deployed OFT contract address on Goerli
        adapterAddress: '0xYourGoerliAdapterAddress' // Replace with your deployed Adapter contract address on Goerli
    },
    bsc: {
        rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/', // BSC Testnet
        endpointId: '102', // Update with the correct endpoint ID for BSC Testnet if available
        oftAddress: '0xYourBscTestnetOFTAddress', // Replace with your deployed OFT contract address on BSC Testnet
        adapterAddress: '0xYourBscTestnetAdapterAddress' // Replace with your deployed Adapter contract address on BSC Testnet
    }
};
var networkConfig = {
    mainnet: mainnetConfig,
    testnet: testnetConfig,
};
exports.default = networkConfig;
