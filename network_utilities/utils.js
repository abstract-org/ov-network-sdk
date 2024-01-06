import * as ethers from 'ethers';
import { events } from './eventHandler';

let provider;
let signer;

const privateProviderUrl = 'https://ovprivate.openvalue.xyz:8077';
const sepoliaProviderUrl = 'https://eth-sepolia.g.alchemy.com/v2/MhpMO1jI-SXis3NtJnI3pUor8bXQMMy8';
const infuraProvider = 'https://sepolia.infura.io/v3/0d1f3867f8234eb482035ea7e10594fa';
const goerliProviderUrl = 'https://eth-goerli.g.alchemy.com/v2/MVR7Yrauf2Pj5txtIC_hiHlOXFUjYjpO';
const mainProviderUrl = 'https://mainnet.infura.io/v3/0d1f3867f8234eb482035ea7e10594fa';


function getWeb3Provider() {
    if (!window.ethereum) {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
      throw new Error('Non-Ethereum browser detected');
    }
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  
  export async function initializeProviderFromCurrentNetwork() {
    const provider = getWeb3Provider();
  
    const network = await provider.getNetwork();
    
    const networkMapping = {
      0x2a: 'private',
      0x1: 'main',
      0x5: 'goerli',
      0xaa36a7: 'sepolia'
    };
  
    const selectedNetwork = networkMapping[network.chainId];
    if (!selectedNetwork) {
      throw new Error('Unsupported network detected. Please switch to the private or Sepolia network.');
    }
  
    return await initializeProvider(selectedNetwork);
  }
  
  export async function initializeProvider(selectedNetwork = 'main') {
    if (!['private', 'sepolia', 'goerli', 'main'].includes(selectedNetwork)) {
      throw new Error('Invalid network specified.');
    }
  
    const providerUrls = {
      'private': privateProviderUrl,
      'sepolia': sepoliaProviderUrl,
      'goerli': goerliProviderUrl,  // Assuming you have a variable named goerliProviderUrl
      'main': mainProviderUrl
    };
  
    let provider;
  
    if (window.ethereum) {
      provider = getWeb3Provider();
      // Request accounts access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Listen for account changes
      window.ethereum.on('accountsChanged', async (accounts) => {
        console.log('Account changed!', accounts[0]);
        // Re-initialize or handle the account change appropriately
        await initializeProvider(selectedNetwork);
      });

    } else {
      provider = new ethers.providers.JsonRpcProvider(providerUrls[selectedNetwork]);
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  
    const signer = provider.getSigner();
    const account = await signer.getAddress();
  
    return { provider, signer, account, network: selectedNetwork };
  }


export async function addNetwork(rpcUrl, chainId, chainName, network) {
    const ethereum = window.ethereum;
    if (!ethereum) {
      console.warn('Please install MetaMask!');
      return;
    }
  
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId,
            rpcUrls: [rpcUrl],
            chainName,
            nativeCurrency: {
              name: 'ETH',
              symbol: 'ETH',
              decimals: 18
            }
          }
        ]
      });
  
      initializeProvider(network); // Initialize the provider with the added network
    } catch (error) {
      console.log(`Add Network ${chainName} Error:`, error);
      const networkErrorEvent = new CustomEvent('error', { detail: error });
      events.dispatchEvent(networkErrorEvent);
      throw error;
    }
  }


export async function switchNetwork(network) {
    if (network !== 'private' && network !== 'sepolia'  && network !== 'goerli' && network !== 'main') {
      console.error('Invalid network specified.');
      return { error: 'Invalid network specified' };
    }
  
    let chainId, rpcUrl, chainName;
    if (network === 'private') {
      chainId = '0x2a';
      rpcUrl = privateProviderUrl;
      chainName = 'Private OV';
  } else if (network === 'goerli') {
      chainId = '0x5';                
      rpcUrl = goerliProviderUrl;      
      chainName = 'Goerli';
  } else if (network === 'sepolia') {
    chainId = '0xaa36a7';                
    rpcUrl = mainProviderUrl;      
    chainName = 'Sepolia';
} 
  else {
      chainId = '0x1';
      rpcUrl = sepoliaProviderUrl;
      chainName = 'Main';
  }
  
    // Switching network in MetaMask
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        });
      } catch (switchError) {
        // If the switch fails, try adding the network
        try {
          await addNetwork(rpcUrl, chainId, chainName, network);
        } catch (addError) {
          console.error(`An error occurred while switching to ${network} network:`, addError);
          return { error: `Unable to switch to ${network} network` };
        }
      }
    }
  
    // Initialize the provider with the selected network
    const result = await initializeProvider(network);
    if (result.error) {
      throw new Error(result.error); // Throw an error instead of returning
    }
  
    // Successful switch
    return { status: '200', data: network };
  }