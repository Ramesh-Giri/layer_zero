// src/contracts/dynamicContractLoader.ts

import { ethers } from "ethers";
import fs from 'fs';
import path from 'path';

export function loadContract(
    signer: ethers.Signer, 
    contractName: string, 
    contractAddress: string
): ethers.Contract {
    const abiPath = path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
    if (!fs.existsSync(abiPath)) {
        throw new Error(`ABI for contract ${contractName} not found at ${abiPath}`);
    }

    const contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
    return new ethers.Contract(contractAddress, contractABI, signer);
}
