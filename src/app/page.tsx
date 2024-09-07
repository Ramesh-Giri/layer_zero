"use client";
import { ethers, Signer } from "ethers";
import React, { useState, useEffect } from 'react';
import Layout from './layout';
import styles from './page.module.css';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import WalletConnectProvider from "@walletconnect/web3-provider";
import networkConfig from '../config/networks'; // Replace with your network configuration
import { setEnforcedOptions, estimateSendFees, sendTokensToDestination } from '../utils/functions'; // Replace with your actual function or logic

declare global {
  interface Window {
    ethereum?: any;
  }
}

const tokenAddresses = {
  ethereum: '0x10456F0788Bfba7405C89451bE257b11b490975E', // Replace with your Ethereum token contract address
  base: '0x0702567B5FD4B823454dEEaDc7Eec8658b2AcB2F', // Replace with your Base token contract address
};

const tokenABI = [
  'function balanceOf(address owner) view returns (uint256)',
];

export default function Home() {
  const [chainFrom, setChainFrom] = useState<'ethereum' | 'base'>('base'); // Default to 'base'
  const [chainTo, setChainTo] = useState<'ethereum' | 'base'>('ethereum'); // Automatically set opposite network
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const preferredWallet = localStorage.getItem('preferredWallet');
    if (preferredWallet) {
      connectWallet(preferredWallet);
    }
  }, []);

  useEffect(() => {
    if (signer && walletAddress) {
      fetchTokenBalance(signer, walletAddress);
    }
  }, [signer, walletAddress, chainFrom]);

  useEffect(() => {
    // Automatically switch the alternative chain and disable the selected option
    setChainTo(chainFrom === 'ethereum' ? 'base' : 'ethereum');
  }, [chainFrom]);

  async function connectWallet(preferredWallet: string) {
    let providerInstance: ethers.BrowserProvider;
  
    if (preferredWallet === "metamask" && typeof window.ethereum !== "undefined") {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        providerInstance = new ethers.BrowserProvider(window.ethereum);

        // Listen for network changes
        window.ethereum.on('chainChanged', () => {
          window.location.reload(); // Reload the page on network change
        });

        // Store the connected wallet in local storage
        localStorage.setItem('preferredWallet', 'metamask');
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        return;
      }
    } else if (preferredWallet === "walletconnect") {
      try {
        const walletConnectProvider = new WalletConnectProvider({
          infuraId: "6ae62b79ee1341898f1ac24796ada458",
        });
        await walletConnectProvider.enable();
        providerInstance = new ethers.BrowserProvider(walletConnectProvider);

        // Store the connected wallet in local storage
        localStorage.setItem('preferredWallet', 'walletconnect');
      } catch (error) {
        console.error("Error connecting to WalletConnect:", error);
        return;
      }
    } else {
      console.error("Unsupported wallet or MetaMask is not installed!");
      return;
    }
  
    try {
      const signerInstance = await providerInstance.getSigner();
      
      // Log the signer and provider details
      console.log("Signer:", signerInstance);
      console.log("Provider:", signerInstance.provider);
  
      const address = await signerInstance.getAddress();
      console.log("Connected wallet address:", address);
  
      setSigner(signerInstance);
      setProvider(providerInstance);
      setWalletAddress(address);
    } catch (error) {
      console.error("Error during wallet interaction:", error);
    }
  }

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setWalletAddress('');
    setTokenBalance('0');
    setAmount('');
    setError('');
    localStorage.removeItem('preferredWallet');
  };

  const fetchTokenBalance = async (signerInstance: ethers.Signer, address: string) => {
    try {
      const tokenAddress = tokenAddresses[chainFrom]; // Use the correct token address based on chainFrom
      console.log(`Fetching balance from chain: ${chainFrom}, tokenAddress: ${tokenAddress}`);
      
      const tokenContract = new Contract(tokenAddress, tokenABI, signerInstance);
      
      const balance = await tokenContract.balanceOf(address);
      console.log(`Balance fetched: ${ethers.formatUnits(balance, 18)}`);
      
      setTokenBalance(formatUnits(balance, 18)); // Assuming the token has 18 decimals
    } catch (err) {
      if(tokenBalance === '0') {
        setError('Failed to fetch token balance. Please swith to the correct network.');
      }
      
      console.error('Token balance fetch error:', err);
    }
  };
  
  const handleMax = () => {
    setAmount(tokenBalance);
  };

  const handleSwap = async () => {
    if (!provider || !walletAddress) {
      setError('No provider or wallet address available');
      return;
    }
  
    if (!amount) {
      setError('Please enter an amount to swap');
      return;
    }
  
    try {
      setError(''); // Clear any previous errors
  
      const signerInstance = await provider.getSigner(); // Await to resolve JsonRpcSigner

      const Options = require('@layerzerolabs/lz-v2-utilities').Options;
      const _options = Options.newOptions().addExecutorLzReceiveOption(1000000, 1);
      const optionsData = _options.toHex();
  
      // Get estimated fees
      const estimatedFees = await estimateSendFees(
        networkConfig.mainnet[chainTo].endpointId, 
        amount.toString(), 
        chainFrom === 'base', 
        optionsData, 
        signerInstance
      );
      
      // Prepare the msgFee object using the estimated fees
      const msgFee = {
        nativeFee: BigInt(estimatedFees.nativeFee), // Convert to BigInt if necessary
        lzTokenFee: BigInt(estimatedFees.lzTokenFee) // Convert to BigInt if necessary
      };
  
      console.log('Sending to address:', tokenAddresses[chainTo]);
      // If gas estimation succeeds, proceed to send the tokens
      const receipt = await sendTokensToDestination({
        amountToSend: amount.toString(),
        msgFee: msgFee,
        encodedOptions: optionsData,
        signer: signerInstance,
        destinationOftAddress: tokenAddresses[chainTo], // Use the appropriate token address
        sourceAdapterAddress: networkConfig.mainnet[chainFrom].adapterAddress, // Dynamic adapter address
        ADAPTER_ABI: require('../../../artifacts/contracts/WhaleAdapter.sol/WhaleAdapter.json').abi, // Use correct ABI
        DESTINATION_ENDPOINT_ID: networkConfig.mainnet[chainTo].endpointId, // Dynamic endpoint ID
      });
  
      console.log('Tokens sent successfully:', receipt);
  
    } catch (err: any) {
          let errorMessage = 'Failed to execute swap: ';
            
          if (err.code === 'ACTION_REJECTED' && err.info?.error?.message) {
            errorMessage += err.info.error.message;
          } else if (err.message) {
            errorMessage += err.message;
          } else {
            errorMessage += 'An unknown error occurred.';
          }

          if (err.transactionHash) {
            errorMessage += ` Transaction hash: ${err.transactionHash}`;
          }

          setError(errorMessage);
          console.error('Swap execution error:', err);    }
  };
  

  return (
    <Layout>
      <div className={styles.topBar}>
        {!walletAddress ? (
          <div className={styles.walletButtons}>
            <button className={styles.button} onClick={() => connectWallet('metamask')}>
              Connect MetaMask
            </button>
            <button className={styles.button} onClick={() => connectWallet('walletconnect')}>
              Connect WalletConnect
            </button>
          </div>
        ) : (
          <button className={styles.button} onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        )}
      </div>
      <div className={styles.container}>
        <h1 className={styles.title}>Welcome to Whale Bridge</h1>
        <div className={styles.swapContainer}>
          <div className={styles.swapRow}>
            <select
              className={styles.select}
              value={chainFrom}
              onChange={(e) => {
                setChainFrom(e.target.value as 'ethereum' | 'base');
                // Re-fetch the balance whenever the network changes
                fetchTokenBalance(signer, walletAddress);
              }}
            >
              <option value="ethereum">Ethereum</option>
              <option value="base">Base</option>
            </select>

            <input
              type="text"
              className={styles.input}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button className={styles.maxButton} onClick={handleMax}>
              Max
            </button>
          </div>
          <div className={styles.swapRow}>
            <select
              className={styles.select}
              value={chainTo}
              onChange={(e) => setChainTo(e.target.value as 'ethereum' | 'base')}
              disabled // Prevents manual selection
            >
              <option value="ethereum" disabled={chainFrom === 'ethereum'}>Ethereum</option>
              <option value="base" disabled={chainFrom === 'base'}>Base</option>
            </select>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.swapButton} onClick={handleSwap}>
            Swap
          </button>
        </div>
        {walletAddress && <p className={styles.info}>Wallet Address: {walletAddress}</p>}
        {tokenBalance && <p className={styles.info}>Token Balance: {tokenBalance}</p>}
      </div>
    </Layout>
  );
}
