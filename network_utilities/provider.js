import * as ethers from 'ethers';
import { privateProviderUrl, sepoliaProviderUrl, infuraProvider, goerliProviderUrl, mainProviderUrl } from './RPCconstants';
import { dbURL, dbURLTestNet, dbURLGoerli, dbURLMain } from '../network_utilities/dbConstants';
import { wssGoerliWebSocketProviderUrl, wssSepoliaWebSocketProviderUrl, wssmainWebSocketProviderUrl } from '../external_api_calls/apiKeys';

let provider;

// Helper function
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
    0x5: 'goerli',
    0xaa36a7: 'sepolia',
    0x1: 'main',
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
    'main': mainProviderUrl,
    'goerli': goerliProviderUrl  // Assuming you have a variable named goerliProviderUrl
  };

  let provider;

  if (window.ethereum) {
    provider = getWeb3Provider();
    // Request accounts access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  } else {
    provider = new ethers.providers.JsonRpcProvider(providerUrls[selectedNetwork]);
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  }

  const signer = provider.getSigner();
  const account = await signer.getAddress();

  return { provider, signer, account, network: selectedNetwork };
}


export async function initializeReadOnlyProvider(currentDBURL) {

    // If provider already exists, return it
    if (provider) {
        // Determine network based on currentDBURL and return
        const networkMap = {
            [dbURL]: 'private',
            [dbURLTestNet]: 'sepolia',
            [dbURLGoerli]: 'goerli',
            [dbURLMain]: 'main',
        };
        const currentNetwork = networkMap[currentDBURL];
        return { provider, network: currentNetwork };
    }

    const goerliWebSocketProviderUrl = wssGoerliWebSocketProviderUrl;
    const sepoliaWebSocketProviderUrl = wssSepoliaWebSocketProviderUrl;
    const mainWebSocketProviderUrl = wssmainWebSocketProviderUrl;
    let providerUrl;
  
    if (currentDBURL === dbURL) {
        providerUrl = privateProviderUrl;
        provider = new ethers.providers.JsonRpcProvider(providerUrl);
        return { provider, network: 'private' };
    } else if (currentDBURL === dbURLTestNet) {
        providerUrl = sepoliaWebSocketProviderUrl;
        provider = new ethers.providers.WebSocketProvider(providerUrl);
          // Add event listeners to monitor the connection status
          provider.on("close", (code, reason) => {
            console.log("WebSocket connection closed", code, reason);
            // Decide here if you want to automatically reconnect or inform the user
        });

        provider.on("error", (error) => {
            console.error("WebSocket encountered an error", error);
            // Handle the error or inform the user
        });

        return { provider, network: 'sepolia' };
    } else if (currentDBURL === dbURLMain) {
      providerUrl = mainWebSocketProviderUrl;
      provider = new ethers.providers.WebSocketProvider(providerUrl);
        // Add event listeners to monitor the connection status
        provider.on("close", (code, reason) => {
          console.log("WebSocket connection closed", code, reason);
          // Decide here if you want to automatically reconnect or inform the user
      });

      provider.on("error", (error) => {
          console.error("WebSocket encountered an error", error);
          // Handle the error or inform the user
      });

      return { provider, network: 'main' };
  }
    else if (currentDBURL === dbURLGoerli) {
        providerUrl = goerliWebSocketProviderUrl;
        provider = new ethers.providers.WebSocketProvider(providerUrl);
        // Add event listeners to monitor the connection status
        provider.on("close", (code, reason) => {
            console.log("WebSocket connection closed", code, reason);
            // Decide here if you want to automatically reconnect or inform the user
        });

        provider.on("error", (error) => {
            console.error("WebSocket encountered an error", error);
            // Handle the error or inform the user
        });

        return { provider, network: 'goerli' };
    } else {
        throw new Error('Invalid database URL selected');
    }
}
