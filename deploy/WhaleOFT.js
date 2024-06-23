"use strict";
// import assert from 'assert'
// import { type DeployFunction } from 'hardhat-deploy/types'
// const contractName = 'WhaleOFT'
// const deploy: DeployFunction = async (hre) => {
//     const { getNamedAccounts, deployments, ethers } = hre
//     const { deploy } = deployments
//     const { deployer } = await getNamedAccounts()
//     assert(deployer, 'Missing named deployer account')
//     console.log(`Network: ${hre.network.name}`)
//     console.log(`Deployer: ${deployer}`)
//     // Check deployer balance
//     const balance = await ethers.provider.getBalance(deployer);
//     console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
//     const endpointV2Deployment = await hre.deployments.get('EndpointV2')
//     const { address } = await deploy(contractName, {
//         from: deployer,
//         args: [
//             'WhaleArmy', // name
//             'WHALE', // symbol
//             endpointV2Deployment.address, // LayerZero's EndpointV2 address
//             deployer, // owner
//         ],
//         log: true,
//         skipIfAlreadyDeployed: false,
//     })
//     console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
// }
// deploy.tags = [contractName]
// export default deploy
// import assert from 'assert'
// import { type DeployFunction } from 'hardhat-deploy/types'
// const contractName = 'WhaleAdapter'
// const deploy: DeployFunction = async (hre) => {
//     const { getNamedAccounts, deployments,ethers } = hre
//     const { deploy } = deployments
//     const { deployer } = await getNamedAccounts()
//     assert(deployer, 'Missing named deployer account')
//     const tokenAdress = '0xCa8e44C73cDCA309EA7615bC74fC1452BE9B3e49';
//     console.log(`Network: ${hre.network.name}`)
//     console.log(`Deployer: ${deployer}`)
//         // Check deployer balance
//     const balance = await ethers.provider.getBalance(deployer);
//     console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
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
// whale TOken on Base sepolia : 0xCa8e44C73cDCA309EA7615bC74fC1452BE9B3e49 -- MAIN token address on Source (Base Sepolia)
// Wale Adapter of Base Sepolia : 0x13baE193504AEc9Cb0103d500417ED80058939d4 -- Adapter deployed on source (Base Sepolia)
//Whale OFT of Sepolia : 0x57827B96CE8f99eed1925c2DfEfb67186FB57915 -- OFT deployed on destination ( Sepolia)
