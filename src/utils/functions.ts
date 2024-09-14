
import networkConfig from '../config/networks';
import { ethers, utils } from 'ethers';
import { providers } from 'ethers';

type TransactionReceipt = providers.TransactionReceipt;

interface PeerContractOptions {
    networks: any[];
    signer: ethers.Signer;
}

export async function setPeerContracts({ networks, signer }: PeerContractOptions) {
    for (const sourceNetwork of networks) {
        const sourceAdapterBytes32 = utils.zeroPad(sourceNetwork.adapterAddress, 32);
        const sourceOFTContract = new ethers.Contract(
            sourceNetwork.oftAddress,
          
            require(`../../../whale_token/artifacts/contracts/WhaleOFT.sol/WhaleOFT.json`).abi,

            signer.connect(sourceNetwork.provider)
        );

        for (const destinationNetwork of networks) {
            if (sourceNetwork.networkKey === destinationNetwork.networkKey) continue;

            const destinationOFTBytes32 = utils.zeroPad(destinationNetwork.oftAddress, 32);
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

    const nonce = await signer.getTransactionCount('latest');

    // Send the transaction with the estimated gas limit
    const txResponse = await sourceAdapterContract.setEnforcedOptions(enforcedOptions, {
      gasLimit: 10000, // Use the calculated gas limit with buffer
      gasPrice: utils.formatUnits("20", "gwei"), // Ensure gasPrice is parsed correctly
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



export async function estimateSendFees(
  dstEid: any, 
  amountToSend: string, 
  isBase: boolean, 
  encodedOptions: string, 
  signer: ethers.Signer
) {

  console.log(`Network : ${isBase ? 'Base' : 'Ethereum'}`);

  const network = isBase ? networkConfig.mainnet.base : networkConfig.mainnet.ethereum;
  const provider = signer.provider;

  const whaleERC20Contract = new ethers.Contract(
    network.oftAddress,
    require('../abi/WhaleTokens.json'),
    signer
  );


  const currentBalance = await whaleERC20Contract.balanceOf(await signer.getAddress());
  console.log(`Current token balance: ${utils.formatUnits(currentBalance, 18)}`);

  console.log(`Amount to send: ${amountToSend}`);

  console.log(`Network adapter address: ${network.adapterAddress}`);

  const approvalAmount = utils.formatUnits(amountToSend, 18);
  const approveTx = await whaleERC20Contract.approve(network.adapterAddress, approvalAmount);
  await approveTx.wait();

  console.log(`Dest id: ${approveTx.hash}`);


  const _sendParam = {
    dstEid: dstEid,
    to: utils.zeroPad(await signer.getAddress(), 32),
    amountLD: approvalAmount,
    minAmountLD: approvalAmount,
    extraOptions: encodedOptions,
    composeMsg: utils.toUtf8Bytes(""),
    oftCmd: utils.toUtf8Bytes("")
  };

  try {
    const adapterContract = new ethers.Contract(
      network.adapterAddress,
      require(`../../../whale_token/artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json`).abi,
      signer
    );
    const feeEstimate = await adapterContract.quoteSend(_sendParam, false);

    console.log(`Estimated fees: ${utils.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${utils.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);

    // Return the fees to be used in the calling function
    return {
      nativeFee: feeEstimate.nativeFee,
      lzTokenFee: feeEstimate.lzTokenFee
    };
  } catch (error) {
    console.error(`Error estimating fees: ${error}`);
    throw new Error('Failed to estimate fees');
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
}: SendTokensParams): Promise<TransactionReceipt | void> {
  try {
    // Validate input parameters
    if (!amountToSend || parseFloat(amountToSend.toString()) <= 0) {
      throw new Error("Invalid or zero amount to send specified.");
    }
    if (!utils.isAddress(destinationOftAddress)) {
      throw new Error("Invalid OFT address specified.");
    }

    // Parse the amount to the correct unit
    const approvalAmount = utils.parseUnits(amountToSend, 18);

    // Prepare the send parameters
    const sendParam = {
      dstEid: DESTINATION_ENDPOINT_ID,
      to: utils.zeroPad(await signer.getAddress(), 32),
      amountLD: approvalAmount,
      minAmountLD: approvalAmount,
      extraOptions: encodedOptions,
      composeMsg: utils.toUtf8Bytes(""),
      oftCmd: utils.toUtf8Bytes("")
    };

    const adapterContract = new ethers.Contract(sourceAdapterAddress, ADAPTER_ABI, signer);

    // Sending tokens, passing msgFee as transaction options
    const txResponse = await adapterContract.send(
      sendParam,
      msgFee,
      await signer.getAddress(),
      {
        value: msgFee.nativeFee, // Ensure to pass the payable amount if required                
      }
    );

    // Wait for the transaction to be mined
    const receipt = await txResponse.wait();

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
