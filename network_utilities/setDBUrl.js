import { dbURL, dbURLTestNet, dbURLGoerli, dbURLMain} from './dbConstants';
import { switchNetwork } from './switchNetwork';
import * as ethers from 'ethers';

//setting this to export because it setDB is called every page refresh/network action so exporting the currentDB
//so that the frontend functions can read it
export let currentDBURL = dbURLTestNet;
export let currentNetwork = 'main';

export async function setDatabaseURL(selectedNetwork) {
    let status, data;
  
    if (selectedNetwork === 'private') {
      currentDBURL = dbURL;
      currentNetwork = 'private';
      data = 'private';
  } else if (selectedNetwork === 'goerli') {
      currentDBURL = dbURLGoerli;    // Assuming you have a variable named dbURLGoerli for Goerli's DB URL.
      currentNetwork = 'goerli';
      data = 'goerli';
  } else if (selectedNetwork === 'sepolia') {
      currentDBURL = dbURLTestNet;
      currentNetwork = 'sepolia';
      data = 'sepolia';
  } else if (selectedNetwork === 'main') {
    currentDBURL = dbURLMain;
    currentNetwork = 'main';
    data = 'main';
} 
  else {
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