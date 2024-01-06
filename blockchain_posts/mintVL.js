import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { events } from '../network_utilities/eventHandler';
import { getConstantsForNetwork } from '../network_utilities/getConstants.js';
import * as ethers from 'ethers';
import fetch from 'node-fetch';


async function calculateSlippage(pairAddress, amountADesired, amountBDesired, reserveTokenA, reserveTokenB) {
  // Get the reserves of the tokens
  const atobratio = reserveTokenA.mul(ethers.utils.parseUnits("1", "ether")).div(reserveTokenB);
  const btoaratio = reserveTokenB.mul(ethers.utils.parseUnits("1", "ether")).div(reserveTokenA);

  let slippageA, slippageB;
  // Calculate slippage for Token A as base and Token B as quote
  slippageA = calculateSlippageForDirection(atobratio, amountADesired, amountBDesired);

  // Calculate slippage for Token B as base and Token A as quote
  slippageB = calculateSlippageForDirection(btoaratio, amountBDesired, amountADesired);

  console.log("Slippage for Token A as base:", ethers.utils.formatEther(slippageA));
  console.log("Slippage for Token B as base:", ethers.utils.formatEther(slippageB));

  return { slippageA, slippageB };
}

function calculateSlippageForDirection(currentRatio, baseAmount, quoteAmount) {
const desiredRatio = baseAmount.mul(ethers.utils.parseUnits("1", "ether")).div(quoteAmount);

let slippage = ethers.BigNumber.from(0);

if (desiredRatio.gt(currentRatio)) {
    // If the desired ratio is greater, the base is being bought with the quote
    const amountNeeded = quoteAmount.mul(currentRatio).div(ethers.utils.parseUnits("1", "ether"));
    slippage = baseAmount.sub(amountNeeded);
} else if (desiredRatio.lt(currentRatio)) {
    // If the desired ratio is lesser, the quote is being bought with the base
    const amountNeeded = baseAmount.div(currentRatio).mul(ethers.utils.parseUnits("1", "ether"));
    slippage = quoteAmount.sub(amountNeeded);
}

return slippage;
}

export async function valuelink(tokenAAddress, tokenBAddress, ethAmount, useOwnedTokens = false, maxSlippage = 0.005) {
   try{
        const { account, signer, network, provider } = await initializeProviderFromCurrentNetwork();
        const {
            MINT_VALUELINK_ADDRESS,
            mint_valuelink_abi,
            UNISWAP_ROUTER,
            uniswap_router_abi,
            simple_token_abi,
            UNISWAP_FACTORY_ADDRESS,
            uniswap_factory_abi,
            uniswap_pair_abi,
            WETH_ADDRESS
          } = getConstantsForNetwork(network);

        const ethAmountparsed = ethers.utils.parseEther(ethAmount);
        const router = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, signer);
        const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, signer);
        const createVL = new ethers.Contract(MINT_VALUELINK_ADDRESS, mint_valuelink_abi, signer);

        const getMinAmountForToken = async (ethAmount, tokenAddress) => {
          const path = [WETH_ADDRESS, tokenAddress];
          const amountsOut = await router.getAmountsOut(ethAmount, path);
          // Calculate the slippage amount
          const slippageAmount = amountsOut[1].mul(ethers.BigNumber.from(Math.round(maxSlippage * 10000))).div(10000);
          // Subtract the slippage amount from the expected amount to get the minimum amount
          return amountsOut[1].sub(slippageAmount);
        };

        const getMinAmountForTokenWithoutSlippage = async (ethAmount, tokenAddress) => {
          const path = [WETH_ADDRESS, tokenAddress];
          const amountsOut = await router.getAmountsOut(ethAmount, path);
          // Calculate the slippage amount
          //const slippageAmount = amountsOut[1].mul(ethers.BigNumber.from(Math.round(maxSlippage * 10000))).div(10000);
          // Subtract the slippage amount from the expected amount to get the minimum amount
          return amountsOut[1];
        };

        const getEthAmount = async (tokenAmount, tokenAddress) => {
          const path = [WETH_ADDRESS, tokenAddress];
          const amountsIn = await router.getAmountsIn(tokenAmount, path);
          // Calculate the slippage amount
          //const slippageAmount = amountsOut[1].mul(ethers.BigNumber.from(Math.round(maxSlippage * 10000))).div(10000);
          // Subtract the slippage amount from the expected amount to get the minimum amount
          return amountsIn[0];
        };
        
        const tokenA = new ethers.Contract(tokenAAddress, simple_token_abi, signer);
        const tokenB = new ethers.Contract(tokenBAddress, simple_token_abi, signer);

        const pairAddress = await factory.getPair(tokenAAddress, tokenBAddress);
        let reserves;
        let adjustedAmountTokenA, adjustedAmountTokenB;
        let tx;
        let halfEthAmount = ethers.utils.parseEther((parseFloat(ethAmount) / 2).toString());

        if (pairAddress !== ethers.constants.AddressZero) {
          console.log(pairAddress);
          const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
          reserves = await pair.getReserves();

            // Correctly matching tokenA and tokenB with reserve0 and reserve1
          const token0 = await pair.token0(); // get the address of token0 in the pair
          let reserveTokenA, reserveTokenB;
          
          if (tokenAAddress.toLowerCase() === token0.toLowerCase()) {
            reserveTokenA = reserves[0];
            reserveTokenB = reserves[1];
          } else {
            reserveTokenA = reserves[1];
            reserveTokenB = reserves[0];
          }
 // console.log(ethers.utils.formatEther(reserveTokenA), ethers.utils.formatEther(reserveTokenB))
        if (useOwnedTokens) {
      //    const totalEthValue = halfEthAmount; // Total ETH value intended to be added as liquidity
          const tokenARatio = reserveTokenA.div(reserveTokenA.add(reserveTokenB));
          const tokenBRatio = reserveTokenB.div(reserveTokenA.add(reserveTokenB));
            // Calculate eth value for each token based on the reserve ratio
      //    const ethValueTokenA = ethAmountparsed.mul(tokenARatio);
      //    const ethValueTokenB = ethAmountparsed.mul(tokenBRatio);

            // Get expected amounts for tokenA and tokenB based on the eth value
          const expectedAmountTokenA = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenAAddress);
          const expectedAmountTokenB = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenBAddress);
//console.log(ethers.utils.formatEther(expectedAmountTokenA), ethers.utils.formatEther(expectedAmountTokenB));


        // Ensure the signer has enough balance
        const signerTokenABalance = await tokenA.balanceOf(account);
        const signerTokenBBalance = await tokenB.balanceOf(account);

        if(signerTokenABalance.lt(expectedAmountTokenA) || signerTokenBBalance.lt(expectedAmountTokenB)) {
            throw new Error("Insufficient token balance.");
        }
// Usage
let slippageResults = await calculateSlippage(pairAddress, expectedAmountTokenA, expectedAmountTokenB, reserveTokenA, reserveTokenB);
//console.log("Slippage Token A:", ethers.utils.formatEther(slippageResults.slippageA));
//console.log("Slippage Token B:", ethers.utils.formatEther(slippageResults.slippageB));


// Determine the correct amount of tokens to maintain the reserve ratio
const tokenAAmounts = expectedAmountTokenA;
const tokenBAmounts = expectedAmountTokenB;

//console.log(ethers.utils.formatEther(reserveTokenB), ethers.utils.formatEther(tokenAAmounts), ethers.utils.formatEther(tokenBAmounts), ethers.utils.formatEther(reserveTokenA));

// Calculate the amounts for each side based on the desired ratio
const desiredRatios = tokenAAmounts.mul(ethers.utils.parseUnits("1", "ether")).div(tokenBAmounts);
//console.log(ethers.utils.formatEther(desiredRatios));
let amountToAddToTokenA;
let amountToAddToTokenB;
if (desiredRatios.gt(tokenARatio)) {
  // More Token A is needed to match the desired ratio
  amountToAddToTokenA = slippageResults.slippageA; // Adjust Token A amount
  amountToAddToTokenB = ethers.BigNumber.from(0); // No adjustment for Token B
 // console.log('amountToAddToTokenA', ethers.utils.formatEther(amountToAddToTokenA), 'amountToAddToTokenB', ethers.utils.formatEther(amountToAddToTokenB) )
} else if (desiredRatios.lt(tokenBRatio)) {
  // More Token B is needed to match the desired ratio
  amountToAddToTokenA = ethers.BigNumber.from(0); // No adjustment for Token A
  amountToAddToTokenB = slippageResults.slippageB; // Adjust Token B amount
  //console.log('amountToAddToTokenA', ethers.utils.formatEther(amountToAddToTokenA), 'amountToAddToTokenB', ethers.utils.formatEther(amountToAddToTokenB) )
}

const adjustedTokenAAmounts = expectedAmountTokenA.sub(amountToAddToTokenA);
const adjustedTokenBAmounts = expectedAmountTokenB.sub(amountToAddToTokenB);

//console.log('adjusted tokena:', ethers.utils.formatEther(adjustedTokenAAmounts));
//console.log('adjusted tokenb:', ethers.utils.formatEther(adjustedTokenBAmounts));

const tokenAAmount = expectedAmountTokenA;
const tokenBAmount = expectedAmountTokenB;
// Calculate the amounts for each side based on the desired ratio
const desiredRatio = expectedAmountTokenA.mul(ethers.utils.parseUnits("1", "ether")).div(expectedAmountTokenB);
const adjustedTokenAAmount = desiredRatio.gt(reserveTokenA.mul(tokenBAmount).div(reserveTokenB))
  ? tokenAAmount.sub(slippageResults.slippageA)
  : tokenAAmount;
const adjustedTokenBAmount = desiredRatio.lt(reserveTokenA.mul(tokenBAmount).div(reserveTokenB))
  ? tokenBAmount.sub(slippageResults.slippageB)
  : tokenBAmount;

//console.log('expected tokena (after adjustment):', ethers.utils.formatEther(adjustedTokenAAmount));
//console.log('expected tokenb (after adjustment):', ethers.utils.formatEther(adjustedTokenBAmount));   

let adjustedAmountTokenApost = expectedAmountTokenA;
let adjustedAmountTokenBpost = expectedAmountTokenB;

// Determine which token has the lower slippage and adjust its amount
if (slippageResults.slippageA.lt(slippageResults.slippageB)) {
    // Token A has lower slippage, adjust its amount
    adjustedAmountTokenApost = expectedAmountTokenA.sub(slippageResults.slippageA);
} else {
    // Token B has lower slippage, adjust its amount
    adjustedAmountTokenBpost = expectedAmountTokenB.sub(slippageResults.slippageB);
}

//console.log('Adjusted Amount Token A:', ethers.utils.formatEther(adjustedAmountTokenApost));
//console.log('Adjusted Amount Token B:', ethers.utils.formatEther(adjustedAmountTokenBpost));// Get expected amounts for tokenA and tokenB

const slippageToleranceOk = ethers.BigNumber.from(Math.round(maxSlippage * 10000));
adjustedAmountTokenA = adjustedAmountTokenApost.mul(10000 - slippageToleranceOk).div(10000);
adjustedAmountTokenB = adjustedAmountTokenBpost.mul(10000 - slippageToleranceOk).div(10000);
//console.log('sent amounts tokena:', ethers.utils.formatEther(expectedAmountTokenA), 'tokenb:', ethers.utils.formatEther(expectedAmountTokenB), 'slippage tokena:', ethers.utils.formatEther(adjustedAmountTokenA), 'tokenb:', ethers.utils.formatEther(adjustedAmountTokenB));


const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
console.log('deadline', deadline);

        // Approve the router to spend the tokens
        await tokenA.approve(MINT_VALUELINK_ADDRESS, expectedAmountTokenA);
        await tokenB.approve(MINT_VALUELINK_ADDRESS, expectedAmountTokenB);
     //   console.log('approved');
     tx = await createVL.addOwnedTokensAsLiquidity(
      tokenAAddress,
      tokenBAddress,
      expectedAmountTokenA, 
      expectedAmountTokenB,
      adjustedAmountTokenA, 
      adjustedAmountTokenB,
      deadline,
      { gasLimit: 5000000 }
  );

      const transactionHash = tx.hash;
      console.log(transactionHash);
  
      const dataToSend = {
        transactionHash: transactionHash,
        network: network,
        tokenAAddress: tokenAAddress,
        tokenBAddress: tokenBAddress,
        ethAmount: ethAmount,
        account: account
      };
      
      // Make a POST request to Cloud Function
      const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/mintValueLinkOwnedTokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.status === 200) {
        console.log('Cloud Function successfully received the data.');
      } else {
        console.error('Cloud Function returned an error:', await response.text());
      }


        } else {
          // Log the reserves for debugging
       //   console.log('tokena', tokenAAddress, ethers.utils.formatEther(reserveTokenA),' tokenb', tokenBAddress, ethers.utils.formatEther(reserveTokenB));


          // Calculate the ratio of Token A to Token B
          const tokenARatio = reserveTokenA.mul(ethers.utils.parseUnits("1", "ether")).div(reserveTokenB);
       //   console.log(ethers.utils.formatEther(tokenARatio)); // Should log a number greater than 0 if reserveTokenA > reserveTokenB

          // Calculate the ratio of Token B to Token A
          const tokenBRatio = reserveTokenB.mul(ethers.utils.parseUnits("1", "ether")).div(reserveTokenA);
        //  console.log(ethers.utils.formatEther(tokenBRatio)); // Should log a number greater than 0 if reserveTokenB > reserveTokenA

          const totalReserves = reserveTokenA.add(reserveTokenB);
          // We multiply before dividing to maintain precision and avoid rounding down to zero
          const ethValueTokenA = ethAmountparsed.mul(reserveTokenA).div(totalReserves);
          const ethValueTokenB = ethAmountparsed.mul(reserveTokenB).div(totalReserves);

        //  console.log(ethers.utils.formatEther(ethValueTokenA), ethers.utils.formatEther(ethValueTokenB));

                // Calculate the total ETH value based on the amounts for each token
        const totalEthValueSent = ethValueTokenA.add(ethValueTokenB);
      //  console.log(ethers.utils.formatEther(ethValueTokenA), ethers.utils.formatEther(ethValueTokenA), 'total eth', ethers.utils.formatEther(totalEthValueSent));

        // Define a buffer ratio, e.g., an additional 1% of the total ETH to send
        const bufferPercentage = 0.01; // 1% buffer

        // Calculate the buffer amount in wei as a BigNumber
        const buffer = totalEthValueSent.mul(ethers.BigNumber.from("100")).div(ethers.BigNumber.from("10000"));

      //  console.log(ethers.utils.formatEther(buffer));

        // Add the buffer to the total ETH value
        const totalEthWithBuffer = totalEthValueSent.add(buffer);

      //  console.log('total eth sent', ethers.utils.formatEther(totalEthWithBuffer), 'total eth sent formatted', ethers.utils.formatEther(totalEthWithBuffer), 'total eth amount original', ethers.utils.formatEther(ethAmountparsed));

        const expectedAmountTokenA = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenAAddress);
        const expectedAmountTokenB = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenBAddress);
     //   console.log(ethers.utils.formatEther(expectedAmountTokenA), ethers.utils.formatEther(expectedAmountTokenB));
        const slippageTolerance = ethers.BigNumber.from(Math.round(maxSlippage * 10000));
        adjustedAmountTokenA = expectedAmountTokenA.mul(10000 - slippageTolerance).div(10000);
        adjustedAmountTokenB = expectedAmountTokenB.mul(10000 - slippageTolerance).div(10000);
      //  console.log('sent amounts tokena:', ethers.utils.formatEther(expectedAmountTokenA), 'tokenb:', ethers.utils.formatEther(expectedAmountTokenB), 'slippage tokena:', ethers.utils.formatEther(adjustedAmountTokenA), 'tokenb:', ethers.utils.formatEther(adjustedAmountTokenB));

// Usage
let slippageResults = await calculateSlippage(pairAddress, expectedAmountTokenA, expectedAmountTokenB, reserveTokenA, reserveTokenB);
//console.log("Slippage Token A:", ethers.utils.formatEther(slippageResults.slippageA));
//console.log("Slippage Token B:", ethers.utils.formatEther(slippageResults.slippageB));


// Determine the correct amount of tokens to maintain the reserve ratio
const tokenAAmounts = expectedAmountTokenA;
const tokenBAmounts = expectedAmountTokenB;

//console.log(ethers.utils.formatEther(reserveTokenB), ethers.utils.formatEther(tokenAAmounts), ethers.utils.formatEther(tokenBAmounts), ethers.utils.formatEther(reserveTokenA));

// Calculate the amounts for each side based on the desired ratio
const desiredRatios = tokenAAmounts.mul(ethers.utils.parseUnits("1", "ether")).div(tokenBAmounts);
//console.log(ethers.utils.formatEther(desiredRatios));
let amountToAddToTokenA;
let amountToAddToTokenB;
if (desiredRatios.gt(tokenARatio)) {
  // More Token A is needed to match the desired ratio
  amountToAddToTokenA = slippageResults.slippageA; // Adjust Token A amount
  amountToAddToTokenB = ethers.BigNumber.from(0); // No adjustment for Token B
//  console.log('amountToAddToTokenA', ethers.utils.formatEther(amountToAddToTokenA), 'amountToAddToTokenB', ethers.utils.formatEther(amountToAddToTokenB) )
} else if (desiredRatios.lt(tokenARatio)) {
  // More Token B is needed to match the desired ratio
  amountToAddToTokenA = ethers.BigNumber.from(0); // No adjustment for Token A
  amountToAddToTokenB = slippageResults.slippageB; // Adjust Token B amount
 // console.log('amountToAddToTokenA', ethers.utils.formatEther(amountToAddToTokenA), 'amountToAddToTokenB', ethers.utils.formatEther(amountToAddToTokenB) )
}

const adjustedTokenAAmounts = expectedAmountTokenA.sub(amountToAddToTokenA);
const adjustedTokenBAmounts = expectedAmountTokenB.sub(amountToAddToTokenB);

//console.log('adjusted tokena:', ethers.utils.formatEther(adjustedTokenAAmounts));
//console.log('adjusted tokenb:', ethers.utils.formatEther(adjustedTokenBAmounts));
// Determine the correct amount of tokens to maintain the reserve ratio
const tokenAAmount = expectedAmountTokenA;
//console.log(ethers.utils.formatEther(reserveTokenB), ethers.utils.formatEther(tokenAAmount), ethers.utils.formatEther(reserveTokenA));
const pre = ethers.utils.formatEther(tokenAAmount) / ethers.utils.formatEther(reserveTokenA);
const be = ethers.utils.formatEther(reserveTokenB) * pre;
//console.log(be);
//const tokenBAmount = reserveTokenB.mul(tokenAAmount).div(reserveTokenA);
//console.log(ethers.utils.formatEther(tokenAAmount), ethers.utils.formatEther(tokenBAmount));

// Adjust token amounts for slippage
//const slippageTolerances = ethers.utils.parseUnits('1', 'ether').mul(maxSlippage).div(100);
//const minTokenAAmount = expectedAmountTokenA.sub(slippageTolerances);
//const minTokenBAmount = expectedAmountTokenB.sub(slippageTolerances);

//console.log('expected tokena:', ethers.utils.formatEther(adjustedAmountTokenA), 'expected tokenb:', ethers.utils.formatEther(adjustedAmountTokenB) );
const tokenBAmount = expectedAmountTokenB;
// Calculate the amounts for each side based on the desired ratio
const desiredRatio = expectedAmountTokenA.mul(ethers.utils.parseUnits("1", "ether")).div(expectedAmountTokenB);
const adjustedTokenAAmount = desiredRatio.gt(reserveTokenA.mul(tokenBAmount).div(reserveTokenB))
  ? tokenAAmount.sub(slippageResults.slippageA)
  : tokenAAmount;
const adjustedTokenBAmount = desiredRatio.lt(reserveTokenA.mul(tokenBAmount).div(reserveTokenB))
  ? tokenBAmount.sub(slippageResults.slippageB)
  : tokenBAmount;

//console.log('expected tokena (after adjustment):', ethers.utils.formatEther(adjustedTokenAAmount));
//console.log('expected tokenb (after adjustment):', ethers.utils.formatEther(adjustedTokenBAmount));        // Get expected amounts for tokenA and tokenB

const slippageToleranceOk = ethers.BigNumber.from(Math.round(maxSlippage * 10000));
adjustedAmountTokenA = adjustedTokenAAmounts.mul(10000 - slippageToleranceOk).div(10000);
adjustedAmountTokenB = adjustedTokenBAmounts.mul(10000 - slippageToleranceOk).div(10000);
//console.log('sent amounts tokena:', ethers.utils.formatEther(expectedAmountTokenA), 'tokenb:', ethers.utils.formatEther(expectedAmountTokenB), 'slippage tokena:', ethers.utils.formatEther(adjustedAmountTokenA), 'tokenb:', ethers.utils.formatEther(adjustedAmountTokenB));

const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
//  const amountTokenA = await getMinAmountForToken(halfEthAmount, tokenAAddress);
      //  const amountTokenB = await getMinAmountForToken(halfEthAmount, tokenBAddress);
        
        // Call the buyTokensAsLiquidity function with min amounts for slippage protection
        tx = await createVL.buyTokensAsLiquidity(
          tokenAAddress,
          tokenBAddress,
          adjustedAmountTokenA, // Minimum amount of token A
          adjustedAmountTokenB, // Minimum amount of token B
          deadline,
          { value: ethAmountparsed, gasLimit: 5000000 }
        );
        

        const transactionHash = tx.hash;
        console.log(transactionHash);
    
        const dataToSend = {
          transactionHash: transactionHash,
          network: network,
          tokenAAddress: tokenAAddress,
          tokenBAddress: tokenBAddress,
          ethAmount: ethAmount,
          account: account
        };
        
        // Make a POST request to Cloud Function
        const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/mintValueLink', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend),
        });

        if (response.status === 200) {
          console.log('Cloud Function successfully received the data.');
        } else {
          console.error('Cloud Function returned an error:', await response.text());
        }
      }
        const receipt = await tx.wait();

    const result = {
        status: "200",
        data: "ValueLink creation or liquidity added successfully",
    }
      return result;

  } else {

      if (useOwnedTokens) {
     //   const amountTokenA = ethers.utils.parseEther(ethAmount);
      //  const amountTokenB = ethers.utils.parseEther(ethAmount);
        // Get expected amounts for tokenA and tokenB

        const amountTokenA = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenAAddress);
        const amountTokenB = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenBAddress);

    //  console.log('tokenAamount', ethers.utils.formatEther(amountTokenA), 'tokenBamount', ethers.utils.formatEther(amountTokenB));
   // const adjustedAmountTokenA = await getMinAmountForToken(halfEthAmount, tokenAAddress);
   // const adjustedAmountTokenB = await getMinAmountForToken(halfEthAmount, tokenBAddress);

      // Ensure the signer has enough balance
      const signerTokenABalance = await tokenA.balanceOf(account);
      const signerTokenBBalance = await tokenB.balanceOf(account);

      if(signerTokenABalance.lt(amountTokenA) || signerTokenBBalance.lt(amountTokenB)) {
          throw new Error("Insufficient token balance.");
      }

      // Approve the router to spend the tokens
      await tokenA.approve(MINT_VALUELINK_ADDRESS, amountTokenA);
      await tokenB.approve(MINT_VALUELINK_ADDRESS, amountTokenB);
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    //   console.log('approved');
    tx = await createVL.addOwnedTokensAsLiquidity(
    tokenAAddress,
    tokenBAddress,
    amountTokenA, // Minimum amount of token A
    amountTokenB,
    amountTokenA, // Minimum amount of token A
    amountTokenB,
    deadline,
    { gasLimit: 5000000 }
    );

    const transactionHash = tx.hash;
    console.log(transactionHash);

    const dataToSend = {
      transactionHash: transactionHash,
      network: network,
      tokenAAddress: tokenAAddress,
      tokenBAddress: tokenBAddress,
      ethAmount: ethAmount,
      account: account
    };

    // Make a POST request to Cloud Function
    const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/mintValueLinkOwnedTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    if (response.status === 200) {
      console.log('Cloud Function successfully received the data.');
    } else {
      console.error('Cloud Function returned an error:', await response.text());
    }

      } else {

      // Get expected amounts for tokenA and tokenB
      const amountTokenA = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenAAddress);
      const amountTokenB = await getMinAmountForTokenWithoutSlippage(halfEthAmount, tokenBAddress);
    //  console.log('tokenAamount', ethers.utils.formatEther(amountTokenA), 'tokenBamount', ethers.utils.formatEther(amountTokenB));
      const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
      // Call the buyTokensAsLiquidity function with min amounts for slippage protection
      tx = await createVL.buyTokensAsLiquidity(
        tokenAAddress,
        tokenBAddress,
        amountTokenA, // Minimum amount of token A
        amountTokenB, // Minimum amount of token B
        deadline, // Deadline for the transaction
        { value: ethAmountparsed, gasLimit: 5000000 }
      );
      

      const transactionHash = tx.hash;
     // console.log(transactionHash);

      const dataToSend = {
        transactionHash: transactionHash,
        network: network,
        tokenAAddress: tokenAAddress,
        tokenBAddress: tokenBAddress,
        ethAmount: ethAmount,
        account: account
      };
      
      // Make a POST request to Cloud Function
      const response = await fetch('https://us-east1-ovweb3.cloudfunctions.net/mintValueLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.status === 200) {
        console.log('Cloud Function successfully received the data.');
      } else {
        console.error('Cloud Function returned an error:', await response.text());
      }
    }
      const receipt = await tx.wait();

    const result = {
      status: "200",
      data: "ValueLink creation or liquidity added successfully",
    }
    return result;
      }

      } catch (error) {
          console.log("ValueLink Error:", error);
          const errorEvent = new CustomEvent('error', { detail: error });
          events.dispatchEvent(errorEvent);
          throw error;
      }
    }




