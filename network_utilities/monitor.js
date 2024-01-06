import { setDatabaseURL, currentDBURL } from './setDBUrl';
import { events } from './eventHandler';
import { dbURL, dbURLTestNet, dbURLGoerli } from './dbConstants';
import * as ethers from 'ethers';

let currentSelectedNetwork;
//let currentDBURL = dbURLTestNet; // Default to the common URL

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
    } else {
      message = 'Unknown database connection.';
    }

    // Dispatch event with the current database information
    const databaseEvent = new CustomEvent('databaseStatus', { detail: message });
    events.dispatchEvent(databaseEvent);
  }
}

