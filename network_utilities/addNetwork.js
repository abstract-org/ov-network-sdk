import { initializeProvider } from './provider'
import { events } from './eventHandler';
import * as ethers from 'ethers';

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