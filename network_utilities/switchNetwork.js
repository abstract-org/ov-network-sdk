import { addNetwork } from './addNetwork'
import { initializeProvider } from './provider';
import { sepoliaProviderUrl, privateProviderUrl, goerliProviderUrl } from './RPCconstants';
import * as ethers from 'ethers';

export async function switchNetwork(network) {
    if (network !== 'private' && network !== 'sepolia'  && network !== 'goerli') {
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
  } else {
      chainId = '0xaa36a7';
      rpcUrl = sepoliaProviderUrl;
      chainName = 'Sepolia';
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