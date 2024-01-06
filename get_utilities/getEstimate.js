import * as ethers from 'ethers';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { UNISWAP_FACTORY_ADDRESS } from '../constants/private';

export async function estimateTokensForExactETH(tokenAddress, ethAmount) {
    try {
        const { network, provider } = await initializeProviderFromCurrentNetwork();
        const { uniswap_router_abi, UNISWAP_ROUTER } = getConstantsForNetwork(network);
        const routerContract = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, provider);
        
        const desiredETH = ethers.utils.parseEther(ethAmount.toString());
        const path = [WETH_ADDRESS, tokenAddress];
        const amountsOut = await routerContract.getAmountsOut(desiredETH, path);
        const tokenAmountExpected = amountsOut[1];
        const tokenAmountExpectedFormatted = ethers.utils.formatUnits(tokenAmountExpected, 18);
    //    console.log(tokenAmountExpectedFormatted);

        return {
        tokenAddress: tokenAddress,
        ethAmount: ethAmount,
        estimatedTokens: tokenAmountExpectedFormatted,
        };
    }catch (error) {
        console.log("Estimate Error:", error);
        return { 
        error: error.message 
        };
    }
    }
    
    export async function estimateETHForExactTokens(tokenAddress, tokenAmount) {
        try {
            const { network, provider } = await initializeProviderFromCurrentNetwork();
            const { uniswap_router_abi, UNISWAP_ROUTER, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi } = getConstantsForNetwork(network);
            const routerContract = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, provider);
            const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
        // Log the addresses
        // Get the pair address for the token and WETH
        const pairAddress = await factoryContract.getPair(WETH_ADDRESS, tokenAddress);

        const pairContractABI = ['function getReserves() external view returns (uint112 reserve0, uint112 reserve1)'];
        const pairContract = new ethers.Contract(pairAddress, pairContractABI, provider);

        // Fetch the reserves
        const reserves = await pairContract.getReserves();

        let tokenReserve;
        if (tokenAddress.toLowerCase() < WETH_ADDRESS.toLowerCase()) {
            tokenReserve = ethers.BigNumber.from(reserves.reserve0);
        } else {
            tokenReserve = ethers.BigNumber.from(reserves.reserve1);
        }

        // Parse the original desired tokens
        const originalDesiredTokens = ethers.utils.parseUnits(tokenAmount.toString(), 18); // Assuming the token has 18 decimals

        // Introduce a small reduction factor (e.g., 0.995 or 99.5% of the reserve)
        const reductionFactor = ethers.BigNumber.from('995');
        const thousand = ethers.BigNumber.from('1000');
        const maxTokens = tokenReserve.mul(reductionFactor).div(thousand);

        // Adjust the desired tokens for buy calculation if it exceeds the reserve
        let adjustedDesiredTokens = originalDesiredTokens;
        if (originalDesiredTokens.gt(maxTokens)) {
            adjustedDesiredTokens = maxTokens; // Adjust to a bit less than max available tokens for buying
        }

        // Buy Cost Calculation with adjusted tokens
        const path1 = [WETH_ADDRESS, tokenAddress];
        const amountsIn = await routerContract.getAmountsIn(adjustedDesiredTokens, path1);
        const amountETHRequired = amountsIn[0];
        const ethSpent = ethers.utils.formatEther(amountETHRequired);

        // Sell Revenue Calculation with original tokens
        const path2 = [tokenAddress, WETH_ADDRESS];
        const amountsOut = await routerContract.getAmountsOut(originalDesiredTokens, path2);
        const amountETHGained = amountsOut[1];
        const ethGained = ethers.utils.formatEther(amountETHGained);
        
        return {
            buy_cost: ethSpent,
            sell_revenue: ethGained
        };
    } catch (error) {
        console.log("Estimate Error:", error);
        throw error;
    }
}
    

    export async function estimateETHForExactTokensRead(tokenAddress, tokenAmount, network, provider ) {
        try {
            const { uniswap_router_abi, UNISWAP_ROUTER, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi } = getConstantsForNetwork(network);
            const routerContract = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, provider);
            const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
        // Log the addresses
        // Get the pair address for the token and WETH
        const pairAddress = await factoryContract.getPair(WETH_ADDRESS, tokenAddress);

        const pairContractABI = ['function getReserves() external view returns (uint112 reserve0, uint112 reserve1)'];
        const pairContract = new ethers.Contract(pairAddress, pairContractABI, provider);

        // Fetch the reserves
        const reserves = await pairContract.getReserves();

        let tokenReserve;
        if (tokenAddress.toLowerCase() < WETH_ADDRESS.toLowerCase()) {
            tokenReserve = ethers.BigNumber.from(reserves.reserve0);
        } else {
            tokenReserve = ethers.BigNumber.from(reserves.reserve1);
        }

        // Parse the original desired tokens
        const originalDesiredTokens = ethers.utils.parseUnits(tokenAmount.toString(), 18); // Assuming the token has 18 decimals

        // Introduce a small reduction factor (e.g., 0.995 or 99.5% of the reserve)
        const reductionFactor = ethers.BigNumber.from('995');
        const thousand = ethers.BigNumber.from('1000');
        const maxTokens = tokenReserve.mul(reductionFactor).div(thousand);

        // Adjust the desired tokens for buy calculation if it exceeds the reserve
        let adjustedDesiredTokens = originalDesiredTokens;
        if (originalDesiredTokens.gt(maxTokens)) {
            adjustedDesiredTokens = maxTokens; // Adjust to a bit less than max available tokens for buying
        }

        // Buy Cost Calculation with adjusted tokens
        const path1 = [WETH_ADDRESS, tokenAddress];
        const amountsIn = await routerContract.getAmountsIn(adjustedDesiredTokens, path1);
        const amountETHRequired = amountsIn[0];
        const ethSpent = ethers.utils.formatEther(amountETHRequired);

        // Sell Revenue Calculation with original tokens
        const path2 = [tokenAddress, WETH_ADDRESS];
        const amountsOut = await routerContract.getAmountsOut(originalDesiredTokens, path2);
        const amountETHGained = amountsOut[1];
        const ethGained = ethers.utils.formatEther(amountETHGained);
        
        return {
            buy_cost: ethSpent,
            sell_revenue: ethGained
        };
    } catch (error) {
        console.log("Estimate Error:", error);
        throw error;
    }
}

export async function estimateTokensForEth(tokenAAddress, tokenBAddress, ethAmount) {
    try {
        const { signer, network } = await initializeProviderFromCurrentNetwork();
        const {
            UNISWAP_ROUTER,
            uniswap_router_abi,
            simple_token_abi,
            WETH_ADDRESS
        } = getConstantsForNetwork(network);
    
        const router = new ethers.Contract(UNISWAP_ROUTER, uniswap_router_abi, signer);
    
        // Parse the eth amount
        const halfEthAmount = ethers.utils.parseEther((parseFloat(ethAmount) / 2).toString());
    
        // Determine amount of tokenA for halfEthAmount
        const pathForTokenA = [WETH_ADDRESS, tokenAAddress];
        const amountsOutTokenA = await router.getAmountsOut(halfEthAmount, pathForTokenA);
        const amountTokenA = amountsOutTokenA[1];
    
        // Determine amount of tokenB for halfEthAmount
        const pathForTokenB = [WETH_ADDRESS, tokenBAddress];
        const amountsOutTokenB = await router.getAmountsOut(halfEthAmount, pathForTokenB);
        const amountTokenB = amountsOutTokenB[1];
    
        return {
            tokenA: ethers.utils.formatEther(amountTokenA),
            tokenB: ethers.utils.formatEther(amountTokenB)
        };
    
    } catch (error) {
        console.error("Error estimating tokens for ETH:", error);
        throw error;
    }
    }