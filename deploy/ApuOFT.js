"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const contractName = 'ApuOFT';
const deploy = async (hre) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    (0, assert_1.default)(deployer, 'Missing named deployer account');
    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer}`);
    const endpointV2Deployment = await hre.deployments.get('EndpointV2');
    const { address } = await deploy(contractName, {
        from: deployer,
        args: [
            'Apu Apustaja', // name
            'APU', // symbol
            endpointV2Deployment.address, // LayerZero's EndpointV2 address
            deployer, // owner
        ],
        log: true,
        skipIfAlreadyDeployed: false,
    });
    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`);
};
deploy.tags = [contractName];
exports.default = deploy;
// import assert from 'assert'
// import { type DeployFunction } from 'hardhat-deploy/types'
// const contractName = 'ApuAdapter'
// const deploy: DeployFunction = async (hre) => {
//     const { getNamedAccounts, deployments } = hre
//     const { deploy } = deployments
//     const { deployer } = await getNamedAccounts()
//     assert(deployer, 'Missing named deployer account')
//     const tokenAdress = '0xD0e2d531762C4b8E9228aD28e87dbA20595Cc987';
//     console.log(`Network: ${hre.network.name}`)
//     console.log(`Deployer: ${deployer}`)
//     const endpointV2Deployment = await hre.deployments.get('EndpointV2')
//     const { address } = await deploy(contractName, {
//         from: deployer,
//         args: [
//             tokenAdress,            
//             endpointV2Deployment.address, // LayerZero's EndpointV2 address
//             deployer, // owner
//         ],
//         log: true,
//         skipIfAlreadyDeployed: false,
//     })
//     console.log(`Deployed Adapter: ${contractName}, network: ${hre.network.name}, address: ${address}`)
// }
// deploy.tags = [contractName]
// export default deploy
