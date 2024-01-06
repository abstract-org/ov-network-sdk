import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { events } from '../network_utilities/eventHandler';
import { getConstantsForNetwork } from '../network_utilities/getConstants.js';
import * as ethers from 'ethers';
import fetch from 'node-fetch';


export async function removeLiquidity(tokenAAddress, tokenBAddress, percentageInput = 100) {
  const percentage = parseInt(percentageInput, 10);
  if (![25, 50, 75, 100].includes(percentage)) {
      throw new Error("Invalid percentage. Allowed values are 25, 50, 75, 100.");
  }  try {
    const { account, signer, network } = await initializeProviderFromCurrentNetwork();
    const {
        UNISWAP_ROUTER,
        uniswap_router_abi,
        uniswap_factory_abi, 
        UNISWAP_FACTORY_ADDRESS,
        uniswap_pair_abi,
      } = getConstantsForNetwork(network);

  const router = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, signer);
  const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, signer); // Assuming you've imported the Uniswap factory ABI and address
  const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
  const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, signer);
  
  // Getting the balance of LP tokens the owner has
  const totalLPBalance = await pair.balanceOf(account);
  const amountToRemove = totalLPBalance.mul(percentage).div(100);
  
  const amount = amountToRemove.toString();

//    Approve the Router contract to spend the LP tokens
  const approveLPToken = await pair.approve(UNISWAP_ROUTER, amount);
  await approveLPToken.wait();
  
  // Set up the amounts
  const amountTokenMin = ethers.utils.parseUnits("0"); // the minimum amount of token1 you'd accept for your LP tokens
  const amountToken2Min = ethers.utils.parseUnits("0"); // the minimum amount of token2 you'd accept for your LP tokens
  const deadline = Math.floor(Date.now() / 1000 + 10 * 60); // 10 minutes from now
  
  // Remove the liquidity
  const removeLiquidityTx = await router.removeLiquidity(
    tokenAAddress,
    tokenBAddress,
    amount,
    amountTokenMin,
    amountToken2Min,
    account,
    deadline,
    { gasLimit: ethers.utils.hexlify(8000000) } 
  );

  const transactionHash = removeLiquidityTx.hash;
  console.log(transactionHash);

  const dataToSend = {
    transactionHash: transactionHash,
    network: network,
    tokenAAddress: tokenAAddress,
    tokenBAddress: tokenBAddress,
    account: account
  };
  
  // Make a POST request to your Cloud Function
  const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/removeLiquidity', {
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

  const receipt = await removeLiquidityTx.wait();
  const result = { 
    status: "200", 
    data: "liquidity removed successfully",
};

return result;
} catch (error) {
    console.log("Quest Error:", error);
    const errorEvent = new CustomEvent('error', { detail: error });
    events.dispatchEvent(errorEvent);
    throw error;
}
}
