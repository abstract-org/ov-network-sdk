import { getTokenMetaData } from '../get_utilities/getTokenMetaData';
import { getTokenBalances } from '../external_api_calls/getTokenBalance';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { fetchEvents } from '../get_utilities/fetchEvents';
import * as ethers from 'ethers';

export async function getWalletTokens(walletAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { uniswap_pair_abi, simple_token_abi, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, OLD_MINT_QUEST_ADDRESS, MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);

    const tokenBalances = await getTokenBalances(walletAddress, network);
    const result = {
        "address": walletAddress,
        "balance": ethers.utils.formatEther(await provider.getBalance(walletAddress))
    };

    const tokenDetailsList = await Promise.all(
        tokenBalances.map(token => getTokenMetaData(token.contractAddress, simple_token_abi, provider))
    );
    const liquidityDetailsList = await Promise.all(tokenBalances.map(async (token, index) => {
        const tokenDetails = tokenDetailsList[index];
        if (tokenDetails.symbol.includes("UNI-V2")) {
            const pairContract = new ethers.Contract(token.contractAddress, uniswap_pair_abi, provider);
            const [token0Address, token1Address, totalSupply, reserves] = await Promise.all([
                pairContract.token0(),
                pairContract.token1(),
                pairContract.totalSupply(),
                pairContract.getReserves()
            ]);

            const token0Details = await getTokenMetaData(token0Address, simple_token_abi, provider);
            const token1Details = await getTokenMetaData(token1Address, simple_token_abi, provider);

            const tokenBalance = ethers.utils.formatEther(token.tokenBalance);
            const proportion = tokenBalance / totalSupply;

            return {
                "token0_address": token0Address,
                "token1_address": token1Address,
                "liquidity_tokens": tokenBalance,
                "paired_with": token1Details.name,
                "paired_with_address": token1Address,
                "tokens_added": proportion * reserves._reserve0,
                "paired_with2": token0Details.name,
                "paired_with_address2": token0Address,
                "tokens_added2": proportion * reserves._reserve1
            };
        }
        return null;
    }));
    // Use the aggregateData function to organize and aggregate the data
    const formattedData = aggregateData(tokenBalances, tokenDetailsList, liquidityDetailsList, WETH_ADDRESS);
    result.owned_tokens = formattedData;
    const fetchPrices = async () => {
        return Promise.all(result.owned_tokens.map(async token => {
            token.current_price = await getPriceForToken(token.token_address, provider, uniswap_pair_abi, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi);
            return token;
        }));
    }
    
    result.owned_tokens = await fetchPrices();

    // Sort the tokens by the product of price and balance
    result.owned_tokens.sort((a, b) => (b.current_price * parseFloat(b.balance)) - (a.current_price * parseFloat(a.balance)));
    
    // Fetch the valid token addresses
    const validTokenAddresses = await getAllValidTokens(provider, OLD_MINT_QUEST_ADDRESS, MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, network);

    // Filter the result to keep only the valid tokens
    result.owned_tokens = result.owned_tokens.filter(token => validTokenAddresses.includes(token.token_address.toLowerCase()));


    return { status: '200', data: result, network };
}


const aggregateData = (tokenBalances, tokenDetailsList, liquidityDetailsList, WETH_ADDRESS) => {
    const aggregatedTokens = [];

    const updateOrAddToken = (tokenName, tokenAddress, balance, liquidityInfo) => {
        if (liquidityInfo && tokenAddress === WETH_ADDRESS) {
            return;
        }
        let tokenEntry = aggregatedTokens.find(token => token.token === tokenName);
    
        if (!tokenEntry) {
            tokenEntry = {
                token: tokenName,
                token_address: tokenAddress, // Add token address
                balance: ethers.utils.formatEther(balance),
                liquidity_tokens: []
            };
            aggregatedTokens.push(tokenEntry);
        } else if (!liquidityInfo) { // If we're not updating due to liquidityInfo, always update balance
            tokenEntry.balance = ethers.utils.formatEther(balance);
        } else if (parseFloat(tokenEntry.balance) === 0.0) { // If updating due to liquidityInfo and current balance is 0
            tokenEntry.balance = ethers.utils.formatEther(balance);
        }
    
    // If liquidityInfo exists and paired_with (or paired_with_address) is NOT WETH, add it
    if (liquidityInfo && liquidityInfo.paired_with_address !== WETH_ADDRESS) {
        tokenEntry.liquidity_tokens.push(liquidityInfo);
    }
    };
    
    
    tokenDetailsList.forEach((tokenDetails, index) => {
        const tokenBalance = tokenBalances[index].tokenBalance;
        const liquidityDetails = liquidityDetailsList[index];
    
        if (tokenDetails.symbol.includes("UNI-V2") && liquidityDetails) {
            updateOrAddToken(liquidityDetails.paired_with, liquidityDetails.paired_with_address, 0, {
                paired_with: liquidityDetails.paired_with2,
                paired_with_address: liquidityDetails.paired_with_address2,
                tokens_added: liquidityDetails.tokens_added2,
                lp_tokens: liquidityDetails.liquidity_tokens
            });
    
            updateOrAddToken(liquidityDetails.paired_with2, liquidityDetails.paired_with_address2, 0, {
                paired_with: liquidityDetails.paired_with,
                paired_with_address: liquidityDetails.paired_with_address,
                tokens_added: liquidityDetails.tokens_added,
                lp_tokens: liquidityDetails.liquidity_tokens
            });
        }
    
        // Update or add the main token
        updateOrAddToken(tokenDetails.name, tokenDetails.tokenAddress, tokenBalance); // Pass token address here
    });

    // Sorting logic can be added here if needed
    return aggregatedTokens;
};

const getPriceForToken = async (tokenAddress, provider, uniswap_pair_abi, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi) => {
    try {
        // First, get the Uniswap pair for the token and WETH
        const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
        const pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);

        if (!pairAddress || pairAddress === ethers.constants.AddressZero) return 0;

        const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
        const reserves = await pair.getReserves();

        let wethReserve, tokenReserve;
        if ((await pair.token0()) === WETH_ADDRESS) {
            wethReserve = reserves._reserve0;
            tokenReserve = reserves._reserve1;
        } else {
            wethReserve = reserves._reserve1;
            tokenReserve = reserves._reserve0;
        }

        // Calculate price. Be careful of precision issues. 
        return wethReserve / tokenReserve;
    } catch (error) {
        console.error("Error getting price for token:", error);
        return 0;
    }
};

async function getAllValidTokens(provider, OLD_MINT_QUEST_ADDRESS, MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, network) {
    const iface2 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);
    const iface3 = new ethers.utils.Interface(["event TokenCreated(address indexed token, address indexed owner)"]);
        
    if (network === 'sepolia') {
        const tokenCreatedEvents1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const tokenCreatedEvents2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const tokenCreatedEvents3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        const events = await Promise.all([tokenCreatedEvents1, tokenCreatedEvents2, tokenCreatedEvents3]);
        const combinedEvents = [].concat(...events); 
        const tokenAddresses = combinedEvents.map(event => event.args[0].toLowerCase());

        return Array.from(new Set(tokenAddresses));
    } else if (network === 'goerli') {
        const tokenCreatedEvents1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        const events = await Promise.all([tokenCreatedEvents1]);
        const tokenAddresses = events[0].map(event => event.args[0].toLowerCase());

        return Array.from(new Set(tokenAddresses));
    } else if (network === 'main') {
        const tokenCreatedEvents1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        const events = await Promise.all([tokenCreatedEvents1]);
        const tokenAddresses = events[0].map(event => event.args[0].toLowerCase());

        return Array.from(new Set(tokenAddresses));
    }
    else {
        throw new Error('Unsupported network');
    }
}
