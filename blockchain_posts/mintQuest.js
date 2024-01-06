import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { events } from '../network_utilities/eventHandler';
import { getConstantsForNetwork } from '../network_utilities/getConstants.js';
import * as ethers from 'ethers';
import fetch from 'node-fetch';


export async function quest(content, buyTokenAmount) {
    try{
    const { account, signer, network } = await initializeProviderFromCurrentNetwork();
    const {
        MINT_QUEST_ADDRESS,
        mint_quest_abi
      } = getConstantsForNetwork(network);

    const name = content;
    const createQuest = new ethers.Contract(MINT_QUEST_ADDRESS, mint_quest_abi, signer);
    const estimatedETH = await createQuest.getEstimatedETH(ethers.utils.parseUnits(buyTokenAmount, 18));
    console.log('estimated ETH', ethers.utils.formatEther(estimatedETH));
    //calculate token amount from eth amount
    /*
    const reserveETH = ethers.utils.parseEther('0.05'); // reserve of ETH (0.05 ETH)
    const reserveToken = ethers.utils.parseUnits('10000', 18); // reserve of token (10,000 tokens)
    const amountOutToken = ethers.utils.parseUnits(buyTokenAmount, 18); // the amount of tokens you want to get an estimate for
    const amountInETH = amountOutToken.mul(reserveETH).mul(1000).div(reserveToken.sub(amountOutToken).mul(997));
    const EthAmount = ethers.utils.parseEther("0.05"); // replace "0.06" with the amount of ETH you want to send
    const other = amountInETH;
    const totalEth = EthAmount.add(other);*/

     // Now let's interact with the contract
     let tx = await createQuest.createTokenAndAddLiquidity(
         name,
         ethers.utils.parseUnits(buyTokenAmount, 18),
         { value: estimatedETH, gasLimit: 6000000  }
     );


    const transactionHash = tx.hash;
    console.log(transactionHash);

    const dataToSend = {
      transactionHash: transactionHash,
      network: network,
      content: content,
      buyTokenAmount: buyTokenAmount,
      account: account,
    };
    
    // Make a POST request to your Cloud Function
    const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/mintQuest', {
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


    let receipt = await tx.wait();

    const result = { 
        status: "200", 
        data: "New token, pair, and liquidity created successfully",
    };
    
    return result;
    } catch (error) {
       console.log("Quest Error:", error);
       const errorEvent = new CustomEvent('error', { detail: error });
       events.dispatchEvent(errorEvent);
       throw error;
   }
 }