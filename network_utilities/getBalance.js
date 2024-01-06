import { events } from "./eventHandler";
import { initializeProviderFromCurrentNetwork } from "./provider";
import * as ethers from 'ethers';

export async function getBalance(updateBalanceURL) {
    const { provider, account, network } = await initializeProviderFromCurrentNetwork();
  
    let balance;
    if (provider && account) {
      try {
        balance = await provider.getBalance(account); 
        balance = ethers.utils.formatEther(balance); 
        console.log(`Balance: ${balance} Ether`);
        console.log('network', network);
        const balanceEvent = new CustomEvent('receipt', {detail: 'Balance ' + balance + ' ETH'});
        events.dispatchEvent(balanceEvent);
  
        // Now make a call to your backend to update the balance
        const formData = new FormData();
        formData.append("address", account);
        formData.append("balance", balance);
  
        const response = await fetch(updateBalanceURL, {
          method: "POST",
          body: formData
      });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
      } catch (error) {
        console.log("Get Balance Error:", error);
        const balanceErrorEvent = new CustomEvent('error', { detail: error });
        events.dispatchEvent(balanceErrorEvent);
        throw error;
      }
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  
    return balance;
  }