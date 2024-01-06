import { getAllPairs } from './getAllPairs.js';
import { getAllTokens } from './getAllTokens.js';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider.js';
import { getConstantsForNetwork } from '../network_utilities/getConstants.js';
import { OLD_MINT_VALUELINK_ADDRESS } from '../constants/main.js';

export async function getAllTokensWithPairs(limit = null, sort_by = 'current_price') {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const {  MINT_VALUELINK_ADDRESS, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, OLDEST_MINT_QUEST_ADDRESS, MINT_VALUELINK_ADDRESS_OLD } = getConstantsForNetwork(network);

    // Fetch all tokens
    const allTokenDetails = await getAllTokens(network, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, OLDEST_MINT_QUEST_ADDRESS);

    // Fetch all pairs
    const allPairDetails = await getAllPairs(network, provider, uniswap_pair_abi, simple_token_abi, MINT_VALUELINK_ADDRESS, UNISWAP_FACTORY_ADDRESS, BLOCK_HEIGHT, WETH_ADDRESS, MINT_VALUELINK_ADDRESS_OLD, OLD_MINT_VALUELINK_ADDRESS);

    // Create a dictionary for fast look-up of token current_price by its address
    const tokenPriceMapping = {};
    const tokenDataMapping = {};

    allTokenDetails.forEach(token => {
        tokenPriceMapping[token.address] = token.current_price;
        tokenDataMapping[token.address] = token;
    });

    // Create a dictionary for fast look-up of pairs by token address
    const tokenPairsMapping = {};

    for (const pair of allPairDetails) {
        // Calculate TVL for the pair using the formula
        const token0Price = parseFloat(tokenPriceMapping[pair.token0Address] || '0');
        const token1Price = parseFloat(tokenPriceMapping[pair.token1Address] || '0');
        const token0Reserve = parseFloat(pair.reserveToken0 || '0');
        const token1Reserve = parseFloat(pair.reserveToken1 || '0');
        
        const TVL = token0Price * token0Reserve + token1Price * token1Reserve;

        // Create a custom structure for each pair
        const customPair = {
            pairAddress: pair.pairAddress,
            TVL: TVL,
            token0: pair.token0Address,
            token0_content: pair.token0,
            token0_data: tokenDataMapping[pair.token0Address],
            token1: pair.token1Address,
            token1_content: pair.token1,
            token1_data: tokenDataMapping[pair.token1Address],
            reserve0: token0Reserve,
            reserve1: token1Reserve
        };

        // Map custom pairs to token addresses
        if (!tokenPairsMapping[pair.token0Address]) {
            tokenPairsMapping[pair.token0Address] = [];
        }
        tokenPairsMapping[pair.token0Address].push(customPair);

        if (!tokenPairsMapping[pair.token1Address]) {
            tokenPairsMapping[pair.token1Address] = [];
        }
        tokenPairsMapping[pair.token1Address].push(customPair);
    }

    // For each token, filter and append all pairs it's a part of and create a custom structure for tokens
    let customTokens = allTokenDetails.map(token => ({
        content: token.name,
        token_address: token.address,
        creator_address: 'creator',
        current_price: token.current_price,
        reserve0: token.reserve0,
        reserve1: token.reserve1,
        valuelinks: tokenPairsMapping[token.address] || []
    }));

    // Sort by current_price
    if (sort_by) {
        customTokens.sort((a, b) => {
            if (a[sort_by] < b[sort_by]) return 1;
            if (a[sort_by] > b[sort_by]) return -1;
            return 0;
        });
    }

    // If 'limit' is set, trim the data to the required limit
    if (limit !== null && limit > 0) {
        customTokens = customTokens.slice(0, limit);
    }

        // Convert the customTokens array to JSON string
        const jsonData = JSON.stringify(customTokens);

        // Create a timestamp for the filename
        const timestamp = new Date().toISOString().replace(/:/g, '-');

        // Define the file path
        const filePath = `json_data/data_${timestamp}.json`;

        // Write the JSON data to the file
        const link = document.createElement('a');
        link.href = `data:text/json;charset=utf-8,${encodeURIComponent(jsonData)}`;
       // link.download = filePath;
       // link.click();
        return customTokens;

}
