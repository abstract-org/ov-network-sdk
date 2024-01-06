import { getHolders } from '../external_api_calls/getHolders';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import * as ethers from 'ethers';

export async function getBlockchainDetailsPair(pairAddress, backendData) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi } = getConstantsForNetwork(network);

    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);

    try {
        const { items } = await getHolders(pairAddress);
 
        const filteredHolders = items.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const liquidityProvidersMap = new Map(backendData.liquidity_providers.map(lp => [lp.owner_address.toLowerCase(), lp]));

        // Get reserves
        const totalSupply = await pair.totalSupply();
        const reserves  = await pair.getReserves();
        const token0Address = await pair.token0();
        const token1Address = await pair.token1();

        let reserve0, reserve1;
        if (token0Address.toLowerCase() === backendData.token0.toLowerCase()) {
            reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve0));
            reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve1));
        } else {
            reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve1));
            reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve0));
        }

        // Check and update reserves if they don't match
    //    if (backendData.reserve0 !== reserve0 || backendData.reserve1 !== reserve1) {
            backendData.reserve0 = reserve0;
            backendData.reserve1 = reserve1;
    //    }

        // Update or Add liquidity providers from the holdersData
        for (const holder of filteredHolders) {
            const holderAddress = holder.address.toLowerCase();
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));
            // Calculate proportion and how many tokens the liquidity balance represents
            const proportion = balance / totalSupply;
            let tokenABalance, tokenBBalance;

            if (token0Address.toLowerCase() === backendData.token0.toLowerCase()) {
                tokenABalance = proportion * reserves._reserve0;
                tokenBBalance = proportion * reserves._reserve1;
            } else {
                tokenABalance = proportion * reserves._reserve1;
                tokenBBalance = proportion * reserves._reserve0;
            }

            let existingLiquidityProvider = liquidityProvidersMap.get(holderAddress);
            
            if (existingLiquidityProvider) {
                if (existingLiquidityProvider.balance !== balance) {
                    existingLiquidityProvider.liquidity_tokens = balance;
                    existingLiquidityProvider.token0_added = tokenABalance;
                    existingLiquidityProvider.token1_added = tokenBBalance;
                }
            } else {
                backendData.liquidity_providers.push({
                    owner_address: holderAddress,
                    liquidity_tokens: balance,
                    token0_added: tokenABalance,
                    token1_added: tokenBBalance
                });
            }
        };

        // Sort the liquidity providers by balance
        backendData.liquidity_providers.sort((a, b) => b.balance - a.balance);

        return { status: '200', data: backendData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}