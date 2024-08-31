
import networkConfig from '../config/networks';
import { ethers } from 'ethers';
import { Signer } from 'ethers';

interface PeerContractOptions {
    networks: any[];
    signer: ethers.Signer;
}

export async function setPeerContracts({ networks, signer }: PeerContractOptions) {
    for (const sourceNetwork of networks) {
        const sourceAdapterBytes32 = ethers.zeroPadValue(sourceNetwork.adapterAddress, 32);
        const sourceOFTContract = new ethers.Contract(
            sourceNetwork.oftAddress,
          
            require(`../../../whale_token/artifacts/contracts/WhaleOFT.sol/WhaleOFT.json`).abi,

            signer.connect(sourceNetwork.provider)
        );

        for (const destinationNetwork of networks) {
            if (sourceNetwork.networkKey === destinationNetwork.networkKey) continue;

            const destinationOFTBytes32 = ethers.zeroPadValue(destinationNetwork.oftAddress, 32);
            const destinationAdapterContract = new ethers.Contract(
                destinationNetwork.adapterAddress,
                require(`../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json`).abi,
                signer.connect(destinationNetwork.provider)
            );

            const isAdapterPeerOfOFT = await sourceOFTContract.isPeer(sourceNetwork.endpointId, destinationOFTBytes32);
            const isOFTPeerOfAdapter = await destinationAdapterContract.isPeer(destinationNetwork.endpointId, sourceAdapterBytes32);

            if (!isAdapterPeerOfOFT || !isOFTPeerOfAdapter) {
                console.log(`Pairing ${sourceNetwork.networkKey} Adapter to ${destinationNetwork.networkKey} OFT...`);
                const txAdapter = await sourceOFTContract.setPeer(destinationNetwork.endpointId, destinationOFTBytes32);
                await txAdapter.wait();

                const txOFT = await destinationAdapterContract.setPeer(sourceNetwork.endpointId, sourceAdapterBytes32);
                await txOFT.wait();
            } else {
                console.log(`${sourceNetwork.networkKey} Adapter and ${destinationNetwork.networkKey} OFT are already paired.`);
            }
        }
    }
}



export async function setEnforcedOptions(signer: ethers.Signer): Promise<string> {
  if (!signer || !signer.provider) {
    throw new Error("Invalid signer or provider. Please ensure the signer is connected.");
  }

  const Options = require('@layerzerolabs/lz-v2-utilities').Options;
  const _options = Options.newOptions().addExecutorLzReceiveOption(1000000, 1);
  const optionsData = _options.toHex();

  const enforcedOptions = [
    {
      eid: networkConfig.mainnet.ethereum.endpointId,
      msgType: 1,
      options: optionsData,
    } 
  ];

  try {
    const sourceNetwork = networkConfig.mainnet.base;
    const sourceAdapterContract = new ethers.Contract(
      sourceNetwork.adapterAddress,
      require(`../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json`).abi,
      signer
    );

    const nonce = await signer.getNonce('latest');

    // // Manually estimate gas by calling the provider's estimateGas function
    // const estimatedGas = await signer.provider.estimateGas({
    //   to: sourceNetwork.adapterAddress,
    //   data: sourceAdapterContract.interface.encodeFunctionData('setEnforcedOptions', [enforcedOptions]),
    //   gasLimit: 100000, // Set a gas limit if required
    //   gasPrice: ethers.parseUnits("20", "gwei"), // Gas price in gwei
    //   nonce: nonce
    // });
    // // Add a buffer to the estimated gas
    // const gasLimitWithBuffer = estimatedGas + 10000n;

    // Send the transaction with the estimated gas limit
    const txResponse = await sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
      gasLimit: 10000, // Use the calculated gas limit with buffer
      gasPrice: ethers.parseUnits("20", "gwei"), // Ensure gasPrice is parsed correctly
      nonce: BigInt(nonce),
    });

    const receipt = await txResponse.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);

    return optionsData;
  } catch (error) {
    console.error('Error setting enforced options:', error);
    throw error;
  }
}



export async function estimateSendFees(dstEid: any, amountToSend: string, isBase: boolean, encodedOptions: string, signer: ethers.Signer) {
    const network = networkConfig.mainnet.base;
    const provider = signer.provider as ethers.JsonRpcProvider;
    const whaleERC20Contract = new ethers.Contract(
        network.oftAddress,
        require('../abi/WhaleTokens.json'),
        signer.connect(provider)
    );

    const currentBalance = await whaleERC20Contract.balanceOf(await signer.getAddress());
    console.log(`Current token balance: ${ethers.formatUnits(currentBalance, 18)}`);

    const approvalAmount = ethers.parseUnits(amountToSend, 18);
    const approveTx = await whaleERC20Contract.approve(network.adapterAddress, approvalAmount);
    await approveTx.wait();

    const _sendParam = {
        dstEid: dstEid,
        to: ethers.zeroPadValue(await signer.getAddress(), 32),
        amountLD: approvalAmount,
        minAmountLD: approvalAmount,
        extraOptions: encodedOptions,
        composeMsg: ethers.toUtf8Bytes(""),
        oftCmd: ethers.toUtf8Bytes("")
    };

    try {
        const adapterContract = new ethers.Contract(
            network.adapterAddress,
            require(`../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json`).abi,
            signer.connect(provider)
        );
        const feeEstimate = await adapterContract.quoteSend(_sendParam, false);

        console.log(`Estimated fees: ${ethers.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${ethers.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);
    } catch (error) {
        console.error(`Error estimating fees: ${error}`);
    }
}


export async function sendTokensToDestination({
  amountToSend,
  msgFee,
  encodedOptions,
  signer,
  destinationOftAddress,
  sourceAdapterAddress,
  ADAPTER_ABI,
  DESTINATION_ENDPOINT_ID,
}: SendTokensParams): Promise<ethers.TransactionReceipt | void> {
  try {
    // Validate input parameters
    if (!amountToSend || parseFloat(amountToSend.toString()) <= 0) {
      throw new Error("Invalid or zero amount to send specified.");
    }
    if (!ethers.isAddress(destinationOftAddress)) {
      throw new Error("Invalid OFT address specified.");
    }

    // Parse the amount to the correct unit
    const approvalAmount = ethers.parseUnits(amountToSend.toString(), 18);

    // Prepare the send parameters
    const sendParam = {
      dstEid: DESTINATION_ENDPOINT_ID,
      to: ethers.zeroPadValue(await signer.getAddress(), 32),
      amountLD: approvalAmount,
      minAmountLD: approvalAmount,
      extraOptions: encodedOptions,
      composeMsg: ethers.toUtf8Bytes(""),
      oftCmd: ethers.toUtf8Bytes("")
    };

    const adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, signer);

    // Log the user's balance before sending tokens
    const balanceBefore = await signer.provider?.getBalance(await signer.getAddress());
    console.log(`Balance before transaction: ${ethers.formatUnits(balanceBefore!, "ether")} ETH`);
    

    // Estimate gas
    const gasEstimate = await adapterContract.estimateGas.send(
      sendParam,
      msgFee,
      await signer.getAddress(),
      { value: msgFee.nativeFee }
    );
    console.log(`Estimated Gas: ${gasEstimate.toString()}`);

    const gasLimitWithBuffer = BigInt(gasEstimate.toString()) + 10000n;


    // Sending tokens, passing msgFee as transaction options
    const txResponse = await adapterContract.send(
      sendParam,
      msgFee,
      await signer.getAddress(),
      {
        gasLimit: gasLimitWithBuffer, // Add buffer as BigInt
        value: msgFee.nativeFee, // Ensure to pass the payable amount if required                
      }
    );

    console.log(`Transaction Hash: ${txResponse.hash}`);

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();
    console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);

    // Log the user's balance after sending tokens
    const balanceAfter = await signer.provider?.getBalance(await signer.getAddress());
console.log(`Balance after transaction: ${ethers.formatUnits(balanceAfter!, "ether")} ETH`);


    return receipt; // Returning the receipt might be useful for further processing

  } catch (error) {
    // Log detailed error message and rethrow or handle appropriately
    console.error('Failed to send tokens:', error);
    throw error; // Rethrowing the error is useful if you want calling functions to handle it
  }
}


interface SendTokensParams {
  amountToSend: string;
  msgFee: { nativeFee: bigint, lzTokenFee: bigint }; // Adjust types as per your needs
  encodedOptions: string;
  signer: ethers.Signer;
  destinationOftAddress: string;
  sourceAdapterAddress: string;
  ADAPTER_ABI: any; // Use the appropriate type if you have one
  DESTINATION_ENDPOINT_ID: string;
}
