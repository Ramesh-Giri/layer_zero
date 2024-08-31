// src/utils/fees.ts

import { ethers } from "ethers";

export async function estimateSendFees({
    signer,
    adapterContract,
    whaleERC20Contract,
    destinationOftAddress,
    amountToSend,
    encodedOptions,
}: {
    signer: ethers.Signer;
    adapterContract: ethers.Contract;
    whaleERC20Contract: ethers.Contract;
    destinationOftAddress: string;
    amountToSend: string;
    encodedOptions: string;
}) {
    
    const currentBalance = await whaleERC20Contract.balanceOf(signer.getAddress());
    console.log(`Current token balance: ${ethers.formatUnits(currentBalance, 18)}`);

    // Parse the amount to the correct unit
    const approvalAmount = ethers.parseUnits(amountToSend.toString(), 18);

    console.log(`Attempting to approve ${ethers.formatUnits(approvalAmount, 18)} tokens`);

    // Approve the OFT contract to move your tokens on both networks
    const approveTx = await whaleERC20Contract.approve(adapterContract.address, approvalAmount);
    await approveTx.wait(); // Wait for the first approval to complete

    console.log(`Approval transaction hash: ${approveTx.hash}`);

    const _sendParam = {
        dstEid: destinationOftAddress,
        to: ethers.zeroPadValue(await signer.getAddress(), 32),
        amountLD: ethers.parseUnits(amountToSend, 18),
        minAmountLD: ethers.parseUnits(amountToSend, 18),
        extraOptions: encodedOptions,
        composeMsg: ethers.toUtf8Bytes(""),
        oftCmd: ethers.toUtf8Bytes("")
    };

    console.log(`Encoded Options being used: ${encodedOptions}`);

    try {
        const feeEstimate = await adapterContract.quoteSend(_sendParam, false);
        console.log(`Estimated fees: ${ethers.formatUnits(feeEstimate.nativeFee, "ether")} ETH, ${ethers.formatUnits(feeEstimate.lzTokenFee, 18)} LZT`);

        // Optionally: you can implement sending the tokens after estimating the fees
        // await sendTokensToDestination(amountToSend, feeEstimate, encodedOptions);

    } catch (error) {
        console.error(`Error estimating fees: ${error}`);
    }
}
