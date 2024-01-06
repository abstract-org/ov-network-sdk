import fetch from 'node-fetch';
import { getSummaryData, getSummaryDataOffline, transformTokenStatsToQuestsFormat } from './requests/getAllTokens';
import { getTokenBlockchain, getPairBlockchain, getPairBlockchainWebSocket, getTokenBlockchainReadOnly, getPrivateTokenBlockchainReadOnly, getPrivateTokenBlockchain, getTokenBlockchainWebSocket } from './serverOps/send2server'
import { dbURL, dbURLTestNet, dbURLGoerli, dbURLMain } from './network_utilities/dbConstants';
import { events } from './network_utilities/eventHandler';
//import { setDatabaseURL } from './network_utilities/setDBUrl';
import { getBlockchainDetailsToken, getBlockchainDetailsTokenHybrid } from './requests/getToken';
import { getBlockchainDetailsPair } from './requests/getPair';
import { getTokenAddressByName, getTokenAddressFromIPFS } from './get_utilities/getAddressFromIPFS'
import { getAllTokensWithPairs } from './requests/getDB';
import { transactionBI, transactionBIOffline } from './requests/getTokenPriceHistory';
import { initializeProviderFromCurrentNetwork, switchNetwork } from './network_utilities/utils';
import { getWalletAddress } from "./network_utilities/getWalletAddress";
import { getWalletTokens } from './requests/getWallet';
import { getBalance } from './network_utilities/getBalance'; 
import { initializeReadOnlyProvider } from './network_utilities/provider';
import { estimateETHForExactTokens, estimateETHForExactTokensRead } from './get_utilities/getEstimate';
import { graphAPI } from './external_api_calls/apiKeys';
//import { currentDBURL } from './network_utilities/setDBUrl';
//import { fetchData } from './get_utilities/fetchData';


//const dbURL = "https://ovweb3.ue.r.appspot.com/";
//const dbURLTestNet = "https://ovsepolia.ue.r.appspot.com/";
let currentDBURL = dbURLMain; // Default to the common URL

let currentSelectedNetwork;
//let currentDBURL = dbURLTestNet; // Default to the common URL

export async function setDatabaseURL(selectedNetwork) {
    let status, data;
  
    if (selectedNetwork === 'private') {
      currentDBURL = dbURL;
      //currentNetwork = 'private';
      data = 'private';
  } else if (selectedNetwork === 'goerli') {
      currentDBURL = dbURLGoerli;    // Assuming you have a variable named dbURLGoerli for Goerli's DB URL.
   //   currentNetwork = 'goerli';
      data = 'goerli';
  } else if (selectedNetwork === 'main') {
    currentDBURL = dbURLMain;    // Assuming you have a variable named dbURLGoerli for Goerli's DB URL.
 //   currentNetwork = 'goerli';
    data = 'main';
}
  else if (selectedNetwork === 'sepolia') {
      currentDBURL = dbURLTestNet;
   //   currentNetwork = 'sepolia';
      data = 'sepolia';
  } else {
      throw new Error('Invalid network specified');
  }
    // Check if ethereum is defined
    if (typeof window.ethereum === 'undefined') {
      console.log('MetaMask or compatible wallet not detected.');
      status = '200'; // Assuming you want to return 200 status even if Ethereum is not defined
      return { status, data };
    }
  
    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const switchResult = await switchNetwork(selectedNetwork);
        if (switchResult.status === '200') {
          status = '200';
          data = selectedNetwork; // Success status
        } else {
          // Handle switching error if necessary
          status = '400'; // Failure status, you can customize this value
          console.error(switchResult.error);
        }
      } else {
        status = '200'; // No accounts, but assuming it's a success status
      }
    } catch (error) {
      console.error(error);
      status = '400'; // Failure status due to error, you can customize this value
    }
  
    return { status, data };
  }

export async function connectToBlockchain() {
let selectedNetwork;
//console.log('loggin in yah!!!');
// Determine the selected network based on the current database URL
if (currentDBURL === dbURL) {
    selectedNetwork = 'private';
} else if (currentDBURL === dbURLTestNet) {
    selectedNetwork = 'sepolia';
} else if (currentDBURL === dbURLGoerli) {
    selectedNetwork = 'goerli';
} else if (currentDBURL === dbURLMain) {
    selectedNetwork = 'main';
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

export function monitorNetworkChanges() {
  if (!window.ethereum) return { status: '202', message: 'MetaMask is not installed' };

  window.ethereum.on('chainChanged', async (chainId) => {
    // Determine the corresponding network
    let selectedNetwork;
    let message;
    switch (chainId) {
      case '0x2a': // Private network
        selectedNetwork = 'private';
        break;
        case '0x1':
            selectedNetwork = 'main';
        break;
      case '0xaa36a7': // Sepolia network
        selectedNetwork = 'sepolia';
        break;
      case '0x5':
        selectedNetwork = 'goerli';
        break;
      default:
        console.warn('Unsupported network detected.');
        message = 'Unsupported network detected.';
        // Optionally, return an object with a status code
        return { status: '400', message };
    }

    // Check if the selected network has changed and respond accordingly
    if (selectedNetwork !== currentSelectedNetwork) {
      currentSelectedNetwork = selectedNetwork; // Update the tracked network
      setDatabaseURL(selectedNetwork); // Update the database URL
      message = `Switched to ${selectedNetwork} network.`;
      const networkChangeEvent = new CustomEvent('networkChange', { detail: message });
      events.dispatchEvent(networkChangeEvent);
      // Optionally, return a success object
      return { status: '200', message };
    }
  });
}

export function checkCurrentNetwork() {
  // Check if MetaMask is installed
  if (!window.ethereum) {
    return Promise.resolve({ status: '202', message: 'MetaMask is not installed' });
  }

  return window.ethereum.request({ method: 'eth_accounts' })
    .then((accounts) => {
      // Check if user is connected to MetaMask
      if (accounts.length === 0) {
        const errorEvent = new CustomEvent('networkNotConnected', { detail: 'You are not connected to the blockchain' });
        events.dispatchEvent(errorEvent);
        return { status: '202', message: 'You are not connected to the blockchain' };
      }

      return window.ethereum.request({ method: 'eth_chainId' }).then((chainId) => {
        let selectedNetwork;
        let message;
        switch (chainId) {
          case '0x2a': // Private network
            selectedNetwork = 'private';
            break;
            case '0x1':
                selectedNetwork = 'main';
            break;
          case '0x5':
            selectedNetwork = 'goerli';
            break;
          case '0xaa36a7': // Sepolia network
            selectedNetwork = 'sepolia';
            break;
          default:
            console.warn('Unsupported network detected.');
            message = 'Unsupported network detected.';
            const wrongNetworkEvent = new CustomEvent('unsupportedNetwork', { detail: 'Unsupported network detected' });
            events.dispatchEvent(wrongNetworkEvent);
            return { status: '400', message };
        }
        message = `Connected to ${selectedNetwork} network.`;
              // Dispatch event
      const networkStatusEvent = new CustomEvent('networkStatus', { detail: message });
      events.dispatchEvent(networkStatusEvent);
        return { status: '200', message, selectedNetwork };
      });
    });
}

export function monitorMetaMaskDisconnection() {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // MetaMask account disconnected
        const disconnectEvent = new CustomEvent('MetaMaskDisconnected', { detail: 'Account disconnected' });
        events.dispatchEvent(disconnectEvent);
      } else {
        // MetaMask account connected
        const connectEvent = new CustomEvent('blockchainConnected', { detail: 'Account connected' });
        events.dispatchEvent(connectEvent);
      }
    });


    window.ethereum.on('disconnect', (error) => {
    //  console.log('MetaMask disconnected', error);
      const disconnectEvent = new CustomEvent('MetaMaskDisconnected', { detail: 'Provider disconnected' });
      events.dispatchEvent(disconnectEvent);
    });

  } else {
    console.log('MetaMask or compatible wallet not detected.');
  }
}


export function getCurrentDatabase() {
  if (typeof window.ethereum === 'undefined' || !ethereum.selectedAddress) {
    let message;

    if (currentDBURL === dbURL) {
      message = 'You are connected to the private database.';
    } else if (currentDBURL === dbURLTestNet) {
      message = 'You are connected to the Sepolia database.';
    } else if (currentDBURL === dbURLGoerli) {
      message = 'You are connected to the Goerli database.';
    } else if (currentDBURL === dbURLMain) {
        message = 'You are connected to the Goerli database.';
      } 
    else {
      message = 'Unknown database connection.';
    }

    // Dispatch event with the current database information
    const databaseEvent = new CustomEvent('databaseStatus', { detail: message });
    events.dispatchEvent(databaseEvent);
  }
}

export async function getQuest(term) {
  if (currentDBURL === dbURLMain) {
    try {
      if (!window.ethereum) {
        const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
     /*   const graphData = await fetchTokens();
        const tokens = graphData.tokens;
    
        // Find a matching pair
        let matchedToken = tokens.find(token => 
            (token.name === term && token.id === term)
        );
    
        if (!matchedToken) {
            // Handle the case where no matching pair is found
            return { status: '202', message: 'token not found' };
        }
        const updatedData = await getTokenBlockchainWebSocket(matchedToken.id, network, provider);
        return { status: '200', data: updatedData };
        */
        let tokenAddress = getTokenAddressByName(term, network);
        if (!tokenAddress) {
            const backendData = await fetchData('token/query/' + term); 
            
            // Early exit if the status is not 200
            if (backendData.status !== '200') {
                return backendData;
            }
            tokenAddress = backendData.data.address;
        }
        if (tokenAddress) {
            const updatedData = await getTokenBlockchainWebSocket(tokenAddress, network, provider);
            return { status: '200', data: updatedData }
        } 

    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });

    if (accounts.length === 0) {
     /* const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
      const graphData = await fetchTokens();
      const tokens = graphData.tokens;
  
      // Find a matching pair
      let matchedToken = tokens.find(token => 
          (token.name === term && token.id === term)
      );
  
      if (!matchedToken) {
          // Handle the case where no matching pair is found
          return { status: '202', message: 'token not found' };
      }
      const updatedData = await getTokenBlockchainWebSocket(matchedToken.id, network, provider);
      return { status: '200', data: updatedData };
      */
      const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
      let tokenAddress = getTokenAddressByName(term, network);

      if (!tokenAddress) {
          const backendData = await fetchData('token/query/' + term); 
          // Early exit if the status is not 200
          if (backendData.status !== '200') {
              return backendData;
          }
          tokenAddress = backendData.data.address;

      }
      if (tokenAddress) {
          const updatedData = await getTokenBlockchainWebSocket(tokenAddress, network, provider);
          return { status: '200', data: updatedData }
      } 
    }
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    let tokenAddress = getTokenAddressByName(term, network);
/*
    console.log(tokenAddress);
    if (!tokenAddress) {
          console.log('pinging graph');
         const tokenData = await getTokenStatsByName(term);
console.log(tokenData);
          if (tokenData.status === 202) {
              // No tokens found
              return { status: 202, message: 'No tokens found' };
          }
      
          // Assuming tokenData contains token address and other details
      //  const backendData = await fetchData('quest/query?content=' + term); 
        
        // Early exit if the status is not 200
      //  if (backendData.status !== '200') {
       ///     return backendData;
      //  }
          // Update tokenAddress with the address from tokenData
    tokenAddress = tokenData.data.id;
    }

     // If it's not private (in this case, it's sepolia), continue with getting blockchain details
     if (tokenAddress) {
      const updatedData = await getTokenBlockchain(tokenAddress, network, provider);
      return { status: '200', data: updatedData };
  }
 */
    
  if (!tokenAddress) {
    const backendData = await fetchData('token/query/' + term); 
  //  console.log(backendData);
                 // Early exit if the status is not 200
                 if (backendData.status !== '200') {
                  return backendData;
              }
   // let tokenAddress = tokenData.find(token => token.name === term)?.address;
   tokenAddress = backendData.data.address
  }
  
  if (tokenAddress) {
      const updatedData = await getTokenBlockchain(tokenAddress, network, provider);
      return { status: '200', data: updatedData }
  }

} catch (error) {
  // Error handling
  console.error(error);
  return { status: '500', message: 'Internal Server Error' };
}
} else {

    if (!window.ethereum) {
        const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
        let tokenAddress = getTokenAddressByName(term, network);
        if (!tokenAddress) {
            const backendData = await fetchData('token/query/' + term); 
            
            // Early exit if the status is not 200
            if (backendData.status !== '200') {
                return backendData;
            }
            tokenAddress = backendData.data.address;
        }
        if (tokenAddress) {
            const updatedData = await getTokenBlockchainWebSocket(tokenAddress, network, provider);
            return { status: '200', data: updatedData }
        } }

    if (currentDBURL === dbURL) {
      const backendData = await fetchData('token/query/' + term);
            // Early exit if the status is not 200
            if (backendData.status !== '200') {
                return backendData;
              }

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
          const updatedData = await getPrivateTokenBlockchainReadOnly(backendData.data.address, currentDBURL);
          return { status: '200', data: updatedData }    
      }
    
      const updatedData = await getPrivateTokenBlockchain(backendData.data.address);
      return { status: '200', data: updatedData }
    }
    ///removing this because it is causing offline to connect
 /*   if (currentDBURL === dbURLMain) {
      const { network, provider } = await initializeProviderFromCurrentNetwork();
      let tokenAddress = getTokenAddressByName(term, network);
      if (!tokenAddress) {
        return { status: '202' };
    }
    
      if (tokenAddress){
       // If it's not private (in this case, it's sepolia), continue with getting blockchain details
       const updatedData = await getTokenBlockchain(tokenAddress, network, provider);
       return { status: '200', data: updatedData }}
    }*/
/*
    const cidEndpoint = "https://gist.githubusercontent.com/peestract/2fe4f4c84c12d1e91cdee24e5f1d5ad9/raw/3c7eb57f81dfbd8e29f0e9c08d7ced572543f84c/cid.json";
    let cid;
    
    try {
        const response = await fetch(cidEndpoint);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            cid = data[data.length - 1].CID; // Grab the CID from the last entry
        } else {
            throw new Error('Unexpected data format from CID endpoint.');
        }
    } catch (error) {
        console.error("Failed to fetch CID:", error);
        return { status: '202' };
    }
    

    // Using the CID to fetch the JSON data from IPFS
    const dataURL = `https://cloudflare-ipfs.com/ipfs/${cid}`;
    let tokenData;
    
    try {
        const response = await fetch(dataURL);
        tokenData = await response.json();
    } catch {
        //console.error("Failed to fetch token data:", error);
        return { status: '202'};
    }

    let tokenAddress = Object.keys(tokenData).find(address => tokenData[address] === term);

  //  if (!tokenAddress) {
    //   const backendData = await fetchData('quest/query?content=' + term); // querying backend with the term
    
    /// If the backend returns a 200 status and the content matches the provided term, use this data.
    //    if (backendData.status === '200' && backendData.data && backendData.data.content === term) {
    //        return backendData;
    //    }
    if (!tokenAddress) { 
        const response = await fetchData('quest/query?content=' + term);
        tokenAddress = response.data.token_address;
   // if (!tokenAddress) {
   //     tokenAddress = getTokenAddressByName(term);
    
        // If still no tokenAddress, return with status 202
        if (!tokenAddress) {
            return { status: '202' };
        }
    //}
}
    
   */

    // Check for Ethereum accounts
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
       // const updatedData = await getTokenBlockchainReadOnly(tokenAddress, currentDBURL);
         // Always start by calling the backend
         const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
         let tokenAddress = getTokenAddressByName(term, network);
         if (!tokenAddress) {
             const backendData = await fetchData('token/query/' + term); 
             
             // Early exit if the status is not 200
             if (backendData.status !== '200') {
                 return backendData;
             }
             tokenAddress = backendData.data.address;
         }
         if (tokenAddress){
          const updatedData = await getTokenBlockchainWebSocket(tokenAddress, network, provider);
          return { status: '200', data: updatedData }}
       //  const backendData = await fetchData('quest/query?content=' + tokenAddress);
     //    return await getBlockchainDetailsTokenHybrid(tokenAddress, backendData.data, currentDBURL);
  //return await fetchData('quest/query?content=' + tokenAddress);      
    }

    // If the currentDBURL is set to private, return the token address
   // if (currentDBURL === dbURL) {
   //     return { status: '200', data: { token_address: tokenAddress }};
   // }

   
   const { network, provider } = await initializeProviderFromCurrentNetwork();
       // Using the CID to fetch the JSON data from IPFS
     /*  const cidEndpoint = "https://gist.githubusercontent.com/peestract/2fe4f4c84c12d1e91cdee24e5f1d5ad9/raw/cid.json";
       let cid;
       try {
        const response = await fetch(cidEndpoint);
       // console.log(response);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
                   // Sort the array based on timestamps in descending order
        const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        // Grab the CID from the first entry after sorting
        cid = sortedData[0].CID;
        } else {
            throw new Error('Unexpected data format from CID endpoint.');
        }
    } catch (error) {
        console.error("Failed to fetch CID:", error);
        return { status: '202' };
    }
    console.log(cid);
    const primaryDataURL = `https://ipfs.io/ipfs/${cid}`;
    const backupDataURL = `https://cloudflare-ipfs.com/ipfs/${cid}`;
    let tokenData;
    
    try {
        let response = await fetch(primaryDataURL);
        if (response.status === 429) {
            response = await fetch(backupDataURL);
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch token data');
        }
        
        tokenData = await response.json();
    } catch (error) {
        console.error("Failed to fetch token data:", error);
        return { status: '202'};
    }
    */
    let tokenAddress = getTokenAddressByName(term, network);
    
    if (!tokenAddress) {
      const backendData = await fetchData('token/query/' + term); 
    //  console.log(backendData);
                   // Early exit if the status is not 200
                   if (backendData.status !== '200') {
                    return backendData;
                }
     // let tokenAddress = tokenData.find(token => token.name === term)?.address;
     tokenAddress = backendData.data.address
    }
    
    if (tokenAddress) {
        const updatedData = await getTokenBlockchain(tokenAddress, network, provider);
      //  console.log(updatedData);
        return { status: '200', data: updatedData }
    }}
}
export async function getSummary() {
  if (currentDBURL === dbURLMain) {
    if (!window.ethereum ) {
      const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
      const summary = await getSummaryDataOffline(network, provider);
      return { status: '200', data: summary }
  }
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
      const summary = await getSummaryDataOffline(network, provider);
      return { status: '200', data: summary }  
    }
  
    const summary =  await getSummaryData();
    return { status: '200', data: summary }
  }
  else {
    return await fetchData('summary');
  }
}

export async function getQuestTransactions(term) {
if (!window.ethereum) {
  const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
  const transaction = await transactionBIOffline(term, network, provider);
return { status: '200', data: transaction };
   // return await fetchData('transaction/query?quest=' + term);
}
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
if (accounts.length === 0) {
  const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
  const transaction = await transactionBIOffline(term, network, provider);
return { status: '200', data: transaction };
   // return await fetchData('transaction/query?quest=' + term);
}

if (currentDBURL === dbURL) {
    return await fetchData('transaction/query?quest=' + term);
}
// Always start by calling the backend
const transaction = await transactionBI(term);
return { status: '200', data: transaction };

}
  

export async function getLink(source, target) {
  if (currentDBURL === dbURLMain) {
    try {
      if (!window.ethereum) {
        const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
        const graphData = await fetchPairs();
        const pairs = graphData.pairs;
    
        // Find a matching pair
        let matchedPair = pairs.find(pair => 
            (pair.token0Name === source && pair.token1Name === target) ||
            (pair.token0Name === target && pair.token1Name === source)
        );
    
        if (!matchedPair) {
            // Handle the case where no matching pair is found
            return { status: '204', message: 'Pair not found' };
        }
        const updatedData = await getPairBlockchainWebSocket(matchedPair.id, network, provider, source, target);
        return { status: '200', data: updatedData };
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
      const graphData = await fetchPairs();
      const pairs = graphData.pairs;

      // Find a matching pair
      let matchedPair = pairs.find(pair => 
          (pair.token0Name === source && pair.token1Name === target) ||
          (pair.token0Name === target && pair.token1Name === source)
      );

      if (!matchedPair) {
          // Handle the case where no matching pair is found
          return { status: '202', message: 'Pair not found' };
      }
      const updatedData = await getPairBlockchainWebSocket(matchedPair.id, network, provider, source, target);
      return { status: '200', data: updatedData };
    }
    const { network, provider } = await initializeProviderFromCurrentNetwork();
  //  console.log('pinging graph');
    const graphData = await fetchPairs();
    const pairs = graphData.pairs;
  //  console.log(pairs);
    // Find a matching pair
    let matchedPair = pairs.find(pair => 
        (pair.token0Name === source && pair.token1Name === target) ||
        (pair.token0Name === target && pair.token1Name === source)
    );
//console.log(matchedPair, matchedPair.id);
    if (!matchedPair) {
        // Handle the case where no matching pair is found
        return { status: '202', message: 'Pair not found' };
    }
    const updatedData = await getPairBlockchain(matchedPair.id, network, provider, source, target);
    return updatedData 

} catch (error) {
  // Error handling
  console.error(error);
  return { status: '500', message: 'Internal Server Error' };
}
} else {
  console.log('going into backend');
let endpoint = 'valuelink/query?';

if (source) {
    endpoint += 'token=' + source;
}

if (target) {
    // If 'source' is also provided, add an '&' before 'additional_token'
    if (source) endpoint += '&';
    endpoint += 'additional_token=' + target;
}
if (!window.ethereum) {
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    const backendData = await fetchData(endpoint);
    // Early exit if the status is not 200
    if (backendData.status !== '200') {
        return backendData;
        }
    const updatedData = await getPairBlockchainWebSocket(backendData.data.pair_address, network, provider, source, target);
    return { status: '200', data: updatedData }
}
const accounts = await window.ethereum.request({ method: 'eth_accounts' });
if (accounts.length === 0) {
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    const backendData = await fetchData(endpoint);
    // Early exit if the status is not 200
    if (backendData.status !== '200') {
        return backendData;
        }
    const updatedData = await getPairBlockchainWebSocket(backendData.data.pair_address, network, provider, source, target);
    return { status: '200', data: updatedData }
}
// Start by calling the backend
const backendData = await fetchData(endpoint);

// Early exit if the status is not 200
if (backendData.status !== '200') {
    return backendData;
}

// If the currentDBURL is set to private, return the backend data immediately
if (currentDBURL === dbURL) {
    return backendData;
}

// Assuming the backendData contains 'token_address' and 'data' like in getQuest
// If it's not private (in this case, it's sepolia), continue with getting blockchain details
const { network, provider } = await initializeProviderFromCurrentNetwork();
const updatedData = await getPairBlockchain(backendData.data.pair_address,network, provider, source, target);
return updatedData 
}}

export async function getQuestEstimate(term, amount) {
        // Check if the term is not likely a valid Ethereum address
        if (!term.startsWith('0x') || term.length !== 42) {
            return await fetchData('token/estimate?token_id=' + term + '&amount=' + amount);
        }
    if (!window.ethereum) {
       // return await fetchData('token/estimate?token_id=' + term + '&amount=' + amount);
       const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
       const result = await estimateETHForExactTokensRead(term, amount, network, provider);
       return { status: '200', data: result }
    }
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
       // return await fetchData('token/estimate?token_id=' + term + '&amount=' + amount);
       const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
       const result = await estimateETHForExactTokensRead(term, amount, network, provider);
       return { status: '200', data: result }
    }
    const result = await estimateETHForExactTokens(term, amount);
    return { status: '200', data: result }
}

export async function getQuestsBackup(limit = null, sort_by = null) {
let endpoint = 'quests-content';

// Add query parameters if provided
const queryParams = [];
if (limit !== null) {
    queryParams.push(`limit=${limit}`);
}
if (sort_by !== null) {
    queryParams.push(`sort_by=${sort_by}`);
}

// Concatenate query parameters with '&' and add them to the endpoint
if (queryParams.length > 0) {
    endpoint += '?' + queryParams.join('&');
}

return await fetchData(endpoint);
}

export async function getQuests(limit = null, sort_by = null) {
  if (currentDBURL === dbURLMain) {
  if (!window.ethereum) {
        return await transformTokenStatsToQuestsFormat();
    }
      // If the currentDBURL is set to private, use getQuestsBackup
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
          return await transformTokenStatsToQuestsFormat();
      }
//      if (currentDBURL === dbURL) {
 //       return await getQuestsBackup(limit, sort_by);
  //    }

let quests = await getAllTokensWithPairs();
//let quests = await fetch('https://bafybeiezebf4sio57j7bqnalteg7zo3gktvxz75dyibfhhg2qfrynpesfa.ipfs.w3s.link/json_data_data_2023-09-18T07-31-20.940Z.json')
// Sort the tokens based on the sort_by parameter, if provided
if (sort_by === 'price') {
    quests.sort((a, b) => parseFloat(b.current_price) - parseFloat(a.current_price)); // Descending order
}

// If a limit is provided, slice the array to include only the specified number of tokens
if (limit !== null) {
    quests = quests.slice(0, limit);
}

return { status: '200', data: quests };
} else {
  if (!window.ethereum) {
    return await getQuestsBackup(limit, sort_by);
}
  // If the currentDBURL is set to private, use getQuestsBackup
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
      return await getQuestsBackup(limit, sort_by);
  }
//      if (currentDBURL === dbURL) {
//       return await getQuestsBackup(limit, sort_by);
//    }

let quests = await getAllTokensWithPairs();
//let quests = await fetch('https://bafybeiezebf4sio57j7bqnalteg7zo3gktvxz75dyibfhhg2qfrynpesfa.ipfs.w3s.link/json_data_data_2023-09-18T07-31-20.940Z.json')
// Sort the tokens based on the sort_by parameter, if provided
if (sort_by === 'price') {
quests.sort((a, b) => parseFloat(b.current_price) - parseFloat(a.current_price)); // Descending order
}

// If a limit is provided, slice the array to include only the specified number of tokens
if (limit !== null) {
quests = quests.slice(0, limit);
}

return { status: '200', data: quests };

}}

export async function getLinks() {
    return await fetchData('valuelinks');
}

export async function getWallet(address) {
if (!window.ethereum) {
    return await fetchData(`wallet?address=${address}&sort_by=value`);
}

const accounts = await window.ethereum.request({ method: 'eth_accounts' });
if (accounts.length === 0) {
    return await fetchData(`wallet?address=${address}&sort_by=value`);
}

const { network } = await initializeProviderFromCurrentNetwork();
let url, updateBalanceURL;
if (network === 'sepolia') {
    const tokenData = await getWalletTokens(address);
    updateBalanceURL = dbURL + 'update_balance';
    // Fetching wallet nickname from the backend
    const backendResponse = await fetchData(`wallet?address=${address}&sort_by=price`);
    if (backendResponse && backendResponse.data) {
        tokenData.data.nickname = backendResponse.data.nickname;
    }

    return tokenData;
}
if (network === 'goerli') {
    const tokenData = await getWalletTokens(address);
    updateBalanceURL = dbURL + 'update_balance';
    // Fetching wallet nickname from the backend
    const backendResponse = await fetchData(`wallet?address=${address}&sort_by=price`);
    if (backendResponse && backendResponse.data) {
        tokenData.data.nickname = backendResponse.data.nickname;
    }

    return tokenData;
}
if (network === 'main') {
  const tokenData = await getWalletTokens(address);
  updateBalanceURL = dbURL + 'update_balance';
  // Fetching wallet nickname from the backend
  const backendResponse = await fetchData(`wallet?address=${address}&sort_by=price`);
  if (backendResponse && backendResponse.data) {
      tokenData.data.nickname = backendResponse.data.nickname;
  }

  return tokenData;
}
if (network === 'private') {
    url = dbURL + `wallet?address=${address}&sort_by=value`;
    updateBalanceURL = dbURL + 'update_balance';
} else {
    throw new Error('Unsupported network detected');
}

const balance = await getBalance(updateBalanceURL);
const response = await fetch(url);
const data = await response.json();
if (data.status === '200') {
    return { status: '200', data: data.data, balance, network };
} else {
    return { status: '202', data: data.data, balance, network };
}
}
  
export async function updateWalletNicknameOld(address, nickname) {
    const endpoint = 'wallet/update_nickname';
    const formData = new FormData();
    formData.append("address", address);
    formData.append("nickname", nickname);

    // Define the complete URLs
    const urls = [dbURL, dbURLTestNet].map(baseURL => baseURL + endpoint);

    // Make POST requests to both URLs
    const responses = await Promise.all(
    urls.map(url =>
        fetch(url, {
        method: 'POST',
        body: formData,
        })
    )
    );

    // Check for success status code from both requests
    const allSuccess = responses.every(response => response.status === 200);

    if (allSuccess) {
    console.log('Nickname updated successfully');
    return { status: '200', data: { address, nickname } };
    } else {
    console.error('An error occurred while updating the wallet nickname.');
    return { status: '400' }; // Customize this value as needed
    }
}

export async function updateWalletNickname(address, nickname) {
    const signer = window.ethereum;
    if (!signer) {
        console.error("Ethereum provider not found");
        return { status: '400', error: 'Ethereum provider not found' };
    }

    // Get the current network and determine the chainId
    const networkName = await signer.request({ method: 'net_version' });
    let chainId;
    let currentDBURL;
    switch (networkName) {
        case '1': // main
            chainId = 1;
            currentDBURL = dbURLMain;
        break;
        case '5': // Goerli
            chainId = 5;
            currentDBURL = dbURLGoerli;
            break;
        case '11155111': // Sepolia (or whatever the id is)
            chainId = 11155111;
            currentDBURL = dbURLTestNet;
            break;
        default:
            return { status: '400', error: 'Unsupported network' };
    }

    // Step 1: Prepare the data to be signed
    const message = {
        domain: {
            chainId: chainId,
            name: 'Open Value',
            version: '1',
        },
        message: {
            description: 'Confirm nickname change to:',
            nickname: nickname
        },
        primaryType: 'NicknameChange',
        types: {
            EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'version', type: 'string' },
                { name: 'chainId', type: 'uint256' },
            ],
            NicknameChange: [
                { name: 'description', type: 'string' },
                { name: 'nickname', type: 'string' },
            ]
        }
    };

    // Step 2: Request signature from user using MetaMask
    let signature;
    try {
        signature = await signer.request({
            method: 'eth_signTypedData_v4',
            params: [address, JSON.stringify(message)],
            from: address
        });
    } catch (error) {
        console.error("Error signing the message", error);
        return { status: '400', error: 'User declined to sign the message' };
    }

    // Step 3: Send data along with the signature to the server
    const endpoint = 'wallet/update_nickname';
    const formData = new FormData();
    formData.append("address", address);
    formData.append("nickname", nickname);
    formData.append("signature", signature);

    // Define the complete URLs
    const urls = [dbURL, dbURLMain, dbURLTestNet, dbURLGoerli].map(baseURL => baseURL + endpoint);

    // Make POST requests to both URLs
    const responses = await Promise.all(
        urls.map(url => fetch(url, { method: 'POST', body: formData }))
    );

    // Check for success status code from both requests
    const allSuccess = responses.every(response => response.status === 200);

    if (allSuccess) {
        console.log('Nickname updated successfully');
        return { status: '200', data: { address, nickname } };
    } else {
        console.error('An error occurred while updating the wallet nickname.');
        return { status: '400' }; // Customize this value as needed
    }
}


export const fetchData = async (endpoint) => {
    let url = currentDBURL + endpoint; // Use the current database URL
    
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === '200') {
        return { status: '200', data: data.data };
        } else {
        return { status: '202', data: data.data };
        }
    };

 
    const GRAPHQL_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${graphAPI}/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum`;

export async function getTokenStatsByName(tokenName) {
    const query = `
        query GetTokenDataByName($name: String!) {
            tokens(where: {name: $name}) {
                name
                id
            }
        }`;

    const variables = {
        name: tokenName
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
        throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
    }

    // Check if tokens are found
    if (data.data.tokens && data.data.tokens.length > 0) {
      // Tokens found, return with status 200
      return { status: 200, data: data.data.tokens[0] };
  } else {
      // No tokens found, return status 202
      return { status: 202, message: 'No tokens found' };
  }
}


async function fetchPairs() {

  const pairsQuery = `
query MyQuery {
  pairs {
    token0Name
    token1Name
    tokenA
    tokenB
    id
  }
}
`;
  const response = await fetch('https://api.studio.thegraph.com/proxy/53594/names/v0.0.8', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      },
      body: JSON.stringify({
          query: pairsQuery
      })
  });
//console.log(response);
  if (!response.ok) {
      throw new Error(`HTTP Error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
      throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
  }

  return data.data;
}


async function fetchTokens() {

  const tokensQuery =`
  query GetTokenDataByName($name: String!) {
      tokens(where: {name: $name}) {
          name
      }
  }`;
  const response = await fetch('https://api.studio.thegraph.com/proxy/53594/names/v0.0.8', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      },
      body: JSON.stringify({
          query: tokensQuery
      })
  });
console.log(response);
  if (!response.ok) {
      throw new Error(`HTTP Error: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errors) {
      throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
  }

  return data.data;
}