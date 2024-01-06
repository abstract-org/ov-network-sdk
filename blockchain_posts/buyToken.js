import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { events } from '../network_utilities/eventHandler';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

export async function buy(tokenAddress, tokenAmount) {
    try {
        const { signer, network } = await initializeProviderFromCurrentNetwork();
        const {
        UNISWAP_ROUTER, 
        uniswap_router_abi, 
        WETH_ADDRESS,
        TX_ADDRESS,
        tx_abi 
        } = getConstantsForNetwork(network);
    
        const beginningEvent = new CustomEvent('status', { detail: 'starting' });
        events.dispatchEvent(beginningEvent);
    
        const routerContract = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, signer);
        const txContract = new ethers.Contract(TX_ADDRESS, tx_abi, signer);
    
        const desiredTokens = ethers.utils.parseUnits(tokenAmount.toString(), 18);
        const path = [WETH_ADDRESS, tokenAddress];
        const amountsIn = await routerContract.getAmountsIn(desiredTokens, path);
        const amountETHRequired = amountsIn[0];
        const ethSpent = ethers.utils.formatEther(amountETHRequired);
    
        const calculatedEthSpent = new CustomEvent('transactionData', {detail: 'going to cost ' + ethSpent + ' ETH'});
        events.dispatchEvent(calculatedEthSpent);
    
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    
        const statusEvent = new CustomEvent('status', { detail: 'waiting for approvals' });
        events.dispatchEvent(statusEvent);
    
        const transaction = await txContract.buyExactTokenWithETH(
            tokenAddress,
            desiredTokens, 
            deadline,
            { 
                value: amountETHRequired,
                gasLimit: ethers.utils.hexlify(2000000) 
            }
        );
        
        // Transaction hash is available here
        const transactionHash = transaction.hash;
    
        const dataToSend = {
        transactionHash: transactionHash,
        network: network,
        };
    
        // Make a POST request to your Cloud Function
        const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/buyToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        });
    
        // Check the response status and handle accordingly
        if (response.status === 200) {
        console.log('Cloud Function successfully received the data.');
        } else {
        console.error('Cloud Function returned an error:', await response.text());
        }
    
        const waitingReceiptEvent = new CustomEvent('status', { detail: 'waiting for receipt' });
        events.dispatchEvent(waitingReceiptEvent);

        const receipt = await transaction.wait();

        const result = { 
            status: "200", 
            data: "Bought tokens successfully",
        };
        
        return result;
    }catch (error) {
        console.log("Buy Error:", error);
        const errorEvent = new CustomEvent('error', { detail: error });
        events.dispatchEvent(errorEvent);
        throw error;
    }
    }