import { getWalletAddress } from "./getWalletAddress";
import { initializeProviderFromCurrentNetwork } from "./provider";
import { events } from './eventHandler';
import { switchNetwork } from "./switchNetwork";
import { dbURL, dbURLTestNet, dbURLGoerli} from './dbConstants';
import { currentDBURL } from './setDBUrl';
import * as ethers from 'ethers';

//let currentDBURL = dbURLTestNet; // Default to the common URL

export async function connectToBlockchain() {
    let selectedNetwork;
  
    // Determine the selected network based on the current database URL
    if (currentDBURL === dbURL) {
      selectedNetwork = 'private';
    } else if (currentDBURL === dbURLTestNet) {
      selectedNetwork = 'sepolia';
    } else if (currentDBURL === dbURLGoerli) {
      selectedNetwork = 'goerli';
    } 
    else {
      console.error('Unknown database URL');
      return { error: 'Unknown database URL' };
    }
  
    const result = await switchNetwork(selectedNetwork);
  
    if (result.error) {
      console.error('Error switching network:', result.error);
      return { status: 'failure', data: result.error };
    }
  
    const walletAddress = await getWalletAddress(); // Get the wallet address
    const connectEvent = new CustomEvent('blockchainConnected', { detail: `Successfully switched to ${selectedNetwork} network.` });
    events.dispatchEvent(connectEvent);
  
    return { status: '200', data: { selectedNetwork, walletAddress } };
  }


  export async function connectMetamask() {
    const { provider, signer } = await initializeProviderFromCurrentNetwork(); // Get provider from initializeProvider
  
    let account;
    if (window.ethereum && signer) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        account = accounts[0];
      } catch (error) {
        console.error("Error occurred", error);
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  
    return { provider, account, signer }; // Return provider along with account and signer
  }
  