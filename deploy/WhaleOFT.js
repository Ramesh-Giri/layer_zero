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
//     const deployArguments = [
//         'WhaleArmy', // name
//         'WHALE', // symbol
//         endpointV2Deployment.address, // LayerZero's EndpointV2 address
//         deployer, // owner
//     ]
//     const deploymentOptions = {
//         from: deployer,
//         args: deployArguments,
//         log: true,
//         skipIfAlreadyDeployed: false,
//         gasLimit: 10000000, // Adjust the gas limit as needed
//     }
//     // Get contract artifact
//     const artifact = await deployments.getArtifact(contractName)
//     // Estimate gas required for deployment
//     const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, ethers.provider.getSigner(deployer))
//     const deployTransaction = factory.getDeployTransaction(...deployArguments)
//     const estimatedGas = await ethers.provider.estimateGas({
//         ...deployTransaction,
//         from: deployer
//     });
//     // Get current gas price
//     const gasPrice = await ethers.provider.getGasPrice()
//     // Calculate estimated deployment cost
//     const estimatedDeploymentCost = estimatedGas.mul(gasPrice)
//     console.log(`Estimated deployment cost: ${ethers.utils.formatEther(estimatedDeploymentCost)} ETH`)
//     const { address } = await deploy(contractName, deploymentOptions)
//     console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
// }
// deploy.tags = [contractName]
// export default deploy
// // import assert from 'assert'
// // import { type DeployFunction } from 'hardhat-deploy/types'
// // const contractName = 'WhaleAdapter'
// // const deploy: DeployFunction = async (hre) => {
// //     const { getNamedAccounts, deployments,ethers } = hre
// //     const { deploy } = deployments
// //     const { deployer } = await getNamedAccounts()
// //     assert(deployer, 'Missing named deployer account')
// //     const tokenAdress = '0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F';
// //     console.log(`Network: ${hre.network.name}`)
// //     console.log(`Deployer: ${deployer}`)
// //         // Check deployer balance
// //     const balance = await ethers.provider.getBalance(deployer);
// //     console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);
// //     const endpointV2Deployment = await hre.deployments.get('EndpointV2')
// //     const { address } = await deploy(contractName, {
// //         from: deployer,
// //         args: [
// //             tokenAdress,            
// //             endpointV2Deployment.address, // LayerZero's EndpointV2 address
// //             deployer, // owner
// //         ],
// //         log: true,
// //         skipIfAlreadyDeployed: false,
// //     })
// //     console.log(`Deployed Adapter: ${contractName}, network: ${hre.network.name}, address: ${address}`)
// // }
// // deploy.tags = [contractName]
// // export default deploy
// // whale TOken on Base  : 0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F -- MAIN token address on Source (Base )
// // Wale Adapter of Base :   0xbB35A07481cC10382D486D97EcB7F878Dfba092e -- Adapter deployed on source (Base)
// // Whale OFT on Ethereum: 0x10456F0788Bfba7405C89451bE257b11b490975E -- OFT deployed on destination ( Ethereum)
// //whale OFT on BSC: 0x7F73A8884Ed3E7bAd79F2f949a1E29F7c0f832Bf -- OFT deployed on destination ( BSC)
