import { getAllTokensWithPairs } from "../requests/getDB";
import { getTokenMetaData } from '../get_utilities/getTokenMetaData'
import { dbURLTestNet } from "../network_utilities/dbConstants";
import { fetchEvents } from '../get_utilities/fetchEvents';
import { getAllPairs } from '../requests/getAllPairs.js';
import { getAllTokens } from '../requests/getAllTokens.js';
import { initializeProviderFromCurrentNetwork, initializeReadOnlyProvider } from '../network_utilities/provider.js';
import { getConstantsForNetwork } from '../network_utilities/getConstants.js';
import fetch from 'node-fetch';
import { getHolders, getAllTokenHolders } from '../external_api_calls/getHolders';
import { isPair } from '../get_utilities/isPair';
import { getPairAddress } from '../get_utilities/getPairAddress';
import { isContract } from '../get_utilities/isContract';
import { getReserves, getReservesETH } from '../get_utilities/getReserves';
import * as ethers from 'ethers';

////misc
export async function getAll() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const {  MINT_VALUELINK_ADDRESS, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);

    // Fetch all tokens
    const allTokenDetails = await getAllTokens(network, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT);

    // Fetch all pairs
    const allPairDetails = await getAllPairs(network, provider, uniswap_pair_abi, simple_token_abi, MINT_VALUELINK_ADDRESS, UNISWAP_FACTORY_ADDRESS, BLOCK_HEIGHT, WETH_ADDRESS);

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

////get token testnet
export async function getTokenBlockchain(tokenAddress, network, provider) {
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const balancesData = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                const holderAddress = holder.address;
                const balance = parseFloat(ethers.utils.formatEther(holder.balance));

                let balanceData = {
                    owner_address: holderAddress,
                    balance: balance,
                    type: 'WALLET', // Default type
                };

                if (contractResults[index]) {
                    if (await isPair(holderAddress, provider, network)) {
                        const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                        const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);
                        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);
                        const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for


                        balanceData.type = 'PAIR';
                        balanceData.additional_token_name = token0Address !== tokenAddress ? token0Name : token1Name;
                        balanceData.additional_token_address = token0Address !== tokenAddress ? token0Address : token1Address;

                        // Handling valueLinks for PAIR
                        const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                        const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                        const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                        const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                        let valueLinkEntry = {
                            pair_address: holderAddress,
                            token0_content: token0Name,
                            token1_content: token1Name,
                            token0: token0Address,
                            token1: token1Address,
                            reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                            reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                        };

                        if (token0Address === tokenAddress) {
                            valueLinkEntry.current_price_token0 = resultData.current_price;
                            valueLinkEntry.current_price_token1 = priceOtherToken;
                        } else {
                            valueLinkEntry.current_price_token0 = priceOtherToken;
                            valueLinkEntry.current_price_token1 = resultData.current_price;
                        }
                        valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1;
                        resultData.valuelinks.push(valueLinkEntry);
                    } else {
                        balanceData.type = 'UNKNOWN';
                    }
                } else {
                    const suppliedNickname = await getNicknameForAddress(holderAddress);
                    if (suppliedNickname) {
                        balanceData.nickname = suppliedNickname;
                    }
                }

                return balanceData;
            })
        );

        resultData.balances = balancesData;
        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
async function getNicknameForAddress(address) {
    // Currently, this function doesn't return any nickname.
    // In the future, you can expand this to fetch or determine nicknames for given addresses.
    return null;
}

export async function getTokenBlockchainWebSocket(tokenAddress, network, provider) {
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const balancesData = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                const holderAddress = holder.address;
                const balance = parseFloat(ethers.utils.formatEther(holder.balance));

                let balanceData = {
                    owner_address: holderAddress,
                    balance: balance,
                    type: 'WALLET', // Default type
                };

                if (contractResults[index]) {
                    if (await isPair(holderAddress, provider, network)) {
                        const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                        const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);
                        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);
                        const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for


                        balanceData.type = 'PAIR';
                        balanceData.additional_token_name = token0Address !== tokenAddress ? token0Name : token1Name;
                        balanceData.additional_token_address = token0Address !== tokenAddress ? token0Address : token1Address;

                        // Handling valueLinks for PAIR
                        const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                        const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                        const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                        const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                        let valueLinkEntry = {
                            pair_address: holderAddress,
                            token0_content: token0Name,
                            token1_content: token1Name,
                            token0: token0Address,
                            token1: token1Address,
                            reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                            reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                        };

                        if (token0Address === tokenAddress) {
                            valueLinkEntry.current_price_token0 = resultData.current_price;
                            valueLinkEntry.current_price_token1 = priceOtherToken;
                        } else {
                            valueLinkEntry.current_price_token0 = priceOtherToken;
                            valueLinkEntry.current_price_token1 = resultData.current_price;
                        }
                        valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1;
                        resultData.valuelinks.push(valueLinkEntry);
                    } else {
                        balanceData.type = 'UNKNOWN';
                    }
                } else {
                    const suppliedNickname = await getNicknameForAddress(holderAddress);
                    if (suppliedNickname) {
                        balanceData.nickname = suppliedNickname;
                    }
                }

                return balanceData;
            })
        );

        resultData.balances = balancesData;
        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}


export async function getTokenBlockchainBeforeFlags(tokenAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractAddresses = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                if (!contractResults[index]) return null;

                const holderAddress = holder.address.toLowerCase();
                const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);

                let tokenName = 'outside contract';
                if (await isPair(holderAddress, provider)) {
                    const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                    const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);

                    const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for

                    const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                    const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                    const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);

                    tokenName = (name === 'Uniswap V2')
                        ? (token0Address !== tokenAddress) ? 'PAIR: ' + token0Name : 'PAIR: ' + token1Name
                        : name;

                        // If this is a PAIR, add to valueLinks
                        if (name === 'Uniswap V2') {
                            const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                            const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                            const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                            const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                            let valueLinkEntry = {
                                pair_address: holderAddress,
                                token0_content: token0Name,
                                token1_content: token1Name,
                                token0: token0Address,
                                token1: token1Address,
                                reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                                reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                            };
                        
                            if (token0Address === tokenAddress) {
                                valueLinkEntry.current_price_token0 = resultData.current_price;  // assuming this is the current price of tokenAddress
                                valueLinkEntry.current_price_token1 = priceOtherToken;
                            } else {
                                valueLinkEntry.current_price_token0 = priceOtherToken;
                                valueLinkEntry.current_price_token1 = resultData.current_price;  // assuming this is the current price of tokenAddress
                            }
                            valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1
                            resultData.valuelinks.push(valueLinkEntry);
                        
                        }
                                    
                }
                return {
                    owner_address: tokenName + ' ' + holderAddress,
                    balance: parseFloat(balance)
                };
            })
        );

        resultData.balances.push(...contractAddresses.filter(Boolean));

        // Handle non-contract holders
        for (let holder of filteredHolders.filter((_, index) => !contractResults[index])) {
            const holderAddress = holder.address.toLowerCase();
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            resultData.balances.push({
                owner_address: holderAddress, //removed 'WALLET'
                balance: parseFloat(balance)
            });
        }

        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}


////get token read only
export async function getTokenBlockchainReadOnly(tokenAddress, currentDBURL) {
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const balancesData = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                const holderAddress = holder.address;
                const balance = parseFloat(ethers.utils.formatEther(holder.balance));

                let balanceData = {
                    owner_address: holderAddress,
                    balance: balance,
                    type: 'WALLET', // Default type
                };

                if (contractResults[index]) {
                        const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                        const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);
                        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);
                        const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for


                        balanceData.type = 'PAIR';
                        balanceData.additional_token_name = token0Address !== tokenAddress ? token0Name : token1Name;
                        balanceData.additional_token_address = token0Address !== tokenAddress ? token0Address : token1Address;

                        // Handling valueLinks for PAIR
                        const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                        const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                        const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                        const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                        let valueLinkEntry = {
                            pair_address: holderAddress,
                            token0_content: token0Name,
                            token1_content: token1Name,
                            token0: token0Address,
                            token1: token1Address,
                            reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                            reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                        };

                        if (token0Address === tokenAddress) {
                            valueLinkEntry.current_price_token0 = resultData.current_price;
                            valueLinkEntry.current_price_token1 = priceOtherToken;
                        } else {
                            valueLinkEntry.current_price_token0 = priceOtherToken;
                            valueLinkEntry.current_price_token1 = resultData.current_price;
                        }
                        valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1;
                        resultData.valuelinks.push(valueLinkEntry);

                } else {
                    const suppliedNickname = await getNicknameForAddress(holderAddress);
                    if (suppliedNickname) {
                        balanceData.nickname = suppliedNickname;
                    }
                }

                return balanceData;
            })
        );

        resultData.balances = balancesData;
        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
////get token private *doesnt check for unknown contracts*
export async function getPrivateTokenBlockchain(tokenAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const balancesData = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                const holderAddress = holder.address;
                const balance = parseFloat(ethers.utils.formatEther(holder.balance));

                let balanceData = {
                    owner_address: holderAddress,
                    balance: balance,
                    type: 'WALLET', // Default type
                };

                if (contractResults[index]) {
                        const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                        const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);
                        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);
                        const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for


                        balanceData.type = 'PAIR';
                        balanceData.additional_token_name = token0Address !== tokenAddress ? token0Name : token1Name;
                        balanceData.additional_token_address = token0Address !== tokenAddress ? token0Address : token1Address;

                        // Handling valueLinks for PAIR
                        const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                        const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                        const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                        const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                        let valueLinkEntry = {
                            pair_address: holderAddress,
                            token0_content: token0Name,
                            token1_content: token1Name,
                            token0: token0Address,
                            token1: token1Address,
                            reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                            reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                        };

                        if (token0Address === tokenAddress) {
                            valueLinkEntry.current_price_token0 = resultData.current_price;
                            valueLinkEntry.current_price_token1 = priceOtherToken;
                        } else {
                            valueLinkEntry.current_price_token0 = priceOtherToken;
                            valueLinkEntry.current_price_token1 = resultData.current_price;
                        }
                        valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1;
                        resultData.valuelinks.push(valueLinkEntry);

                } else {
                    const suppliedNickname = await getNicknameForAddress(holderAddress);
                    if (suppliedNickname) {
                        balanceData.nickname = suppliedNickname;
                    }
                }

                return balanceData;
            })
        );

        resultData.balances = balancesData;
        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
////get token private read only
export async function getPrivateTokenBlockchainReadOnly(tokenAddress, currentDBURL) {
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const resultData = {
        token_address: tokenAddress,
        balances: [],
        reserve0: null,
        reserve1: null,
        current_price: null,
        valuelinks: [] 
    };

    try {
        const [holdersData, pairAddress, tokenContent, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getTokenName(tokenAddress, simple_token_abi, provider),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);
        const reserveData = await getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS);
        const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
        const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
        
        resultData.reserve0 = parseFloat(reserve0);
        resultData.reserve1 = parseFloat(reserve1);
        resultData.current_price = resultData.reserve0 / resultData.reserve1;

        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractAddresses = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                if (!contractResults[index]) return null;

                const holderAddress = holder.address.toLowerCase();
                const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);

                let tokenName = 'outside contract';
                {
                    const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                    const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);

                    const tokenToFetchPairFor = token0Address === tokenAddress ? token1Address : token0Address; // Determine which token to fetch the pair for

                    const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                    const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                    const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);

                    tokenName = (name === 'Uniswap V2')
                        ? (token0Address !== tokenAddress) ? 'PAIR: ' + token0Name : 'PAIR: ' + token1Name
                        : name;

                        // If this is a PAIR, add to valueLinks
                        if (name === 'Uniswap V2') {
                            const pairedWithWETH = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenToFetchPairFor, WETH_ADDRESS);
                            const reserves = await getReservesETH(provider, uniswap_pair_abi, pairedWithWETH, WETH_ADDRESS);
                            const priceOtherToken = ethers.utils.formatEther(reserves.reserve0) / ethers.utils.formatEther(reserves.reserve1);
                            const pairReserves = await getReserves(provider, uniswap_pair_abi, holderAddress);
                            let valueLinkEntry = {
                                pair_address: holderAddress,
                                token0_content: token0Name,
                                token1_content: token1Name,
                                token0: token0Address,
                                token1: token1Address,
                                reserve0: parseFloat(ethers.utils.formatEther(pairReserves.reserve0)),
                                reserve1: parseFloat(ethers.utils.formatEther(pairReserves.reserve1))
                            };
                        
                            if (token0Address === tokenAddress) {
                                valueLinkEntry.current_price_token0 = resultData.current_price;  // assuming this is the current price of tokenAddress
                                valueLinkEntry.current_price_token1 = priceOtherToken;
                            } else {
                                valueLinkEntry.current_price_token0 = priceOtherToken;
                                valueLinkEntry.current_price_token1 = resultData.current_price;  // assuming this is the current price of tokenAddress
                            }
                            valueLinkEntry.TVL = valueLinkEntry.current_price_token0 * valueLinkEntry.reserve0 + valueLinkEntry.current_price_token1 * valueLinkEntry.reserve1
                            resultData.valuelinks.push(valueLinkEntry);
                        
                        }
                                    
                }
                return {
                    owner_address: tokenName + ' ' + holderAddress,
                    balance: parseFloat(balance)
                };
            })
        );

        resultData.balances.push(...contractAddresses.filter(Boolean));

        // Handle non-contract holders
        for (let holder of filteredHolders.filter((_, index) => !contractResults[index])) {
            const holderAddress = holder.address.toLowerCase();
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            resultData.balances.push({
                owner_address: 'WALLET: ' + holderAddress,
                balance: parseFloat(balance)
            });
        }

        resultData.content = tokenContent;
        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return resultData;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
////getTokens for all function
export async function getTokenForAll(tokenAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi) {

    const resultData = {
        balances: []
    };

    try {
        const [holdersData, pairAddress, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);


        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractAddresses = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                if (!contractResults[index]) return null;

                const holderAddress = holder.address.toLowerCase();
                const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
        
        
                let tokenName = 'outside contract';
                return {
                    owner_address: tokenName + ' ' + holderAddress,
                    balance: parseFloat(balance)
                };
            })
        );

        resultData.balances.push(...contractAddresses.filter(Boolean));

        // Handle non-contract holders
        for (let holder of filteredHolders.filter((_, index) => !contractResults[index])) {
            const holderAddress = holder.address.toLowerCase();
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            resultData.balances.push({
                owner_address: holderAddress,
                balance: parseFloat(balance)
            });
        }

        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return  resultData ;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}


////getPair
export async function getPairBlockchain(pairAddress, network, provider, source, target) {
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
    const resultData = {
        liquidity_providers: [],
        reserve0: null,
        reserve1: null,
        token0_data: null,
        token1_data: null
    };

    try {
        const holdersData = await getAllTokenHolders(pairAddress, provider, uniswap_pair_abi);
        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const token0Address = await pair.token0();
        const token1Address = await pair.token1();
        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);

        const [token0Data, token1Data] = await Promise.all([
            getTokenBlockchain(token0Address, network, provider),
            getTokenBlockchain(token1Address, network, provider)
        ]);
        resultData.token0_content = token0Name;
        resultData.token1_content = token1Name;
        resultData.token0 = token0Address;
        resultData.token1 = token1Address;
        resultData.token0_data = token0Data;
        resultData.token1_data = token1Data;
        resultData.current_price_token0 = token0Data.current_price;
        resultData.current_price_token1 = token1Data.current_price;

        const reserves  = await pair.getReserves();
        resultData.reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve0));

        resultData.reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve1));

        // Process liquidity providers from the holdersData
        const totalSupply = await pair.totalSupply();

        resultData.TVL = token0Data.current_price * resultData.reserve0 + token1Data.current_price * resultData.reserve1;

        for (const holder of filteredHolders) {
            const holderAddress = holder.address;
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));

            const proportion = balance / totalSupply;
            const tokenABalance = proportion * reserves._reserve0;
            const tokenBBalance = proportion * reserves._reserve1;

            resultData.liquidity_providers.push({
                owner_address: holderAddress,
                liquidity_tokens: balance,
                token0_added: tokenABalance,
                token1_added: tokenBBalance
            });
        }
        return { status: '200', data: reorderData(resultData, source, target, token0Name, token1Name) };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}

function reorderData(resultData, source, target, token0Name, token1Name) {
    // If the source token matches the token0Address, then return the resultData as is
    if (source.toLowerCase() === token0Name.toLowerCase()) {
        return resultData;
    }

    // Swap the token0 and token1 details
    [resultData.token0_content, resultData.token1_content] = [resultData.token1_content, resultData.token0_content];
    [resultData.token0, resultData.token1] = [resultData.token1, resultData.token0];
    [resultData.token0_data, resultData.token1_data] = [resultData.token1_data, resultData.token0_data];
    [resultData.current_price_token0, resultData.current_price_token1] = [resultData.current_price_token1, resultData.current_price_token0];
    [resultData.reserve0, resultData.reserve1] = [resultData.reserve1, resultData.reserve0];

    // Swap the token amounts for liquidity providers
    for (const lp of resultData.liquidity_providers) {
        [lp.token0_added, lp.token1_added] = [lp.token1_added, lp.token0_added];
    }

    return resultData;
}


export async function getPairBlockchainWebSocket(pairAddress, network, provider, source, target,) {
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
    const resultData = {
        liquidity_providers: [],
        reserve0: null,
        reserve1: null,
        token0_data: null,
        token1_data: null
    };
    try {
        const holdersData = await getAllTokenHolders(pairAddress, provider, uniswap_pair_abi);
        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        const token0Address = await pair.token0();
        const token1Address = await pair.token1();
        const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
        const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
        const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);

        const [token0Data, token1Data] = await Promise.all([
            getTokenBlockchainWebSocket(token0Address, network, provider),
            getTokenBlockchainWebSocket(token1Address, network, provider)
        ]);
        resultData.token0_content = token0Name;
        resultData.token1_content = token1Name;
        resultData.token0 = token0Address;
        resultData.token1 = token1Address;
        resultData.token0_data = token0Data;
        resultData.token1_data = token1Data;
        resultData.current_price_token0 = token0Data.current_price;
        resultData.current_price_token1 = token1Data.current_price;

        const reserves  = await pair.getReserves();
        resultData.reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve0));

        resultData.reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve1));

        // Process liquidity providers from the holdersData
        const totalSupply = await pair.totalSupply();

        resultData.TVL = token0Data.current_price * resultData.reserve0 + token1Data.current_price * resultData.reserve1;

        for (const holder of filteredHolders) {
            const holderAddress = holder.address.toLowerCase();
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));

            const proportion = balance / totalSupply;
            const tokenABalance = proportion * reserves._reserve0;
            const tokenBBalance = proportion * reserves._reserve1;

            resultData.liquidity_providers.push({
                owner_address: holderAddress,
                liquidity_tokens: balance,
                token0_added: tokenABalance,
                token1_added: tokenBBalance
            });
        }

        return reorderData(resultData, source, target, token0Name, token1Name)

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
////getPairs for the all function
export async function getPairForAll(pairAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi) {

    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);

    const resultData = {
        liquidity_providers: []
    };

    try {
        const holdersData = await getAllTokenHolders(pairAddress, provider, uniswap_pair_abi);
        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());


        const reserves  = await pair.getReserves();
        resultData.reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve0));

        resultData.reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve1));

        // Process liquidity providers from the holdersData
        const totalSupply = await pair.totalSupply();

        for (const holder of filteredHolders) {
            const holderAddress = holder.address.toLowerCase();
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));

            const proportion = balance / totalSupply;
            const tokenABalance = proportion * reserves._reserve0;
            const tokenBBalance = proportion * reserves._reserve1;

            resultData.liquidity_providers.push({
                owner_address: holderAddress,
                liquidity_tokens: balance,
                token0_added: tokenABalance,
                token1_added: tokenBBalance
            });
        }

        return { status: '200', data: resultData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}


////misc
export async function fetchBlockchainData(address) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    let isToken = true;
    let pairAddress = address;
    if (!await isPair(address, provider)) {
        isToken = true;
        pairAddress = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, address, WETH_ADDRESS);
    }

    const [holdersData, pair] = await Promise.all([
        getHolders(address),
        new ethers.Contract(pairAddress, uniswap_pair_abi, provider)
    ]);

    const filteredHolders = holdersData.items.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

    const results = {};

    // Common logic to extract balances
    results.balances = filteredHolders.map(holder => ({
        owner_address: holder.address.toLowerCase(),
        balance: parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5)
    }));

    // Specific logic for tokens
    if (isToken) {
        const reserveData = await getReserves(provider, uniswap_pair_abi, pairAddress);
        if (reserveData) {
            const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
            const reserve1 = ethers.utils.formatEther(reserveData.reserve1);

            results.reserve0 = address.toLowerCase() === WETH_ADDRESS.toLowerCase() ? parseFloat(reserve0) : parseFloat(reserve1);
            results.reserve1 = address.toLowerCase() === WETH_ADDRESS.toLowerCase() ? parseFloat(reserve1) : parseFloat(reserve0);
            results.current_price = results.reserve0 / results.reserve1;
        }
    }

    // Specific logic for pairs
    else {
        const totalSupply = await pair.totalSupply();
        const reserves = await pair.getReserves();
        const token0Address = await pair.token0();
        const token1Address = await pair.token1();

        results.liquidity_providers = filteredHolders.map(async holder => {
            const holderAddress = holder.address.toLowerCase();
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));
            const proportion = balance / totalSupply;
            const tokenABalance = proportion * (token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase() ? reserves._reserve0 : reserves._reserve1);
            const tokenBBalance = proportion * (token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase() ? reserves._reserve1 : reserves._reserve0);

            return {
                owner_address: holderAddress,
                liquidity_tokens: balance,
                token0_added: tokenABalance,
                token1_added: tokenBBalance
            };
        });
    }

    return results;
}
async function getTokenName(tokenAddress, simple_token_abi, provider){
    const tokenContract = new ethers.Contract(tokenAddress, simple_token_abi, provider);
    const mainTokenName = await tokenContract.name();
    return mainTokenName;
}
async function getCreatorAddress(tokenContractAddress, provider, simple_token_abi) {
    try {
        const contract = new ethers.Contract(tokenContractAddress, simple_token_abi, provider);
        const transferFilter = contract.filters.Transfer(null, null);
        const logs = await provider.getLogs({
            fromBlock: 0,
            toBlock: 'latest',
            address: tokenContractAddress,
            topics: transferFilter.topics
        });
        
        if (logs.length === 0) {
            console.error("No transfer logs found for this contract");
            return null;
        }
        const firstLog = logs[0];
        const txHash = firstLog.transactionHash;  // This is the transaction hash
        const txDetails = await provider.getTransaction(txHash);
        const creatorAddress = txDetails.from;  // This is the address that created the contract
        return creatorAddress;
    } catch (error) {
        console.error("Error fetching creator address:", error);
        return null;
    }
}




///////syncs
export async function getTokenForAllPrivateSync(tokenAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi) {

    const resultData = {
        balances: []
    };

    try {
        const [holdersData, pairAddress, creatorName] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS),
            getCreatorAddress(tokenAddress, provider, simple_token_abi)
        ]);


        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));
/*
        const contractAddresses = await Promise.all(
            filteredHolders.map(async (holder, index) => {
                if (!contractResults[index]) return null;

                const holderAddress = holder.address.toLowerCase();
                const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
        
        
                let tokenName = 'outside contract';
                return {
                    owner_address: tokenName + ' ' + holderAddress,
                    balance: parseFloat(balance)
                };
            })
        );

        resultData.balances.push(...contractAddresses.filter(Boolean));
*/
        // Handle non-contract holders
        for (let holder of filteredHolders.filter((_, index) => !contractResults[index])) {
            const holderAddress = holder.address;
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            resultData.balances.push({
                owner_address: holderAddress,
                balance: parseFloat(balance)
            });
        }

        resultData.creator_address = creatorName;

        resultData.balances.sort((a, b) => b.balance - a.balance);
        return  resultData ;

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
export async function getAllTokensForAllPrivateSync() {
    //const { network, provider } = await initializeReadOnlyProvider(dbURLTestNet);
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);

    const iface = new ethers.utils.Interface(["event LiquidityAdded(address,address)"]);
    const iface2 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);
    const iface3 = new ethers.utils.Interface(["event TokenCreated(address indexed token, address indexed owner)"]);

    const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
    
    let events, tokenAddresses;
    if (network === 'private') {
        const privateEvents1 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents2 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents5 = fetchEvents(provider, QUEST_FACTORY_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        // Wait for both fetches to complete
        events = await Promise.all([privateEvents5, privateEvents1, privateEvents2]);
    
        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events);
    
        tokenAddresses = combinedEvents.map(event => event.args[0]);
    } else {
        const events1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
      //  const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
      //  const events3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        events = await Promise.all([events1]);

        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events); 

        tokenAddresses = combinedEvents.map(event => event.args[0]); 
    }
    const allTokenDetails = await Promise.all(tokenAddresses.map(async tokenAddress => {
        const tokenFullDetails = await getTokenForAllPrivateSync(tokenAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi);
        const metadata = await getTokenMetaData(tokenAddress, simple_token_abi, provider);

        const pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);
        
        
        let reserveToken, reserveWETH, current_price;
        if (pairAddress && pairAddress !== ethers.constants.AddressZero) {
            const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
            const token0 = await pairContract.token0();
            let [reserve0, reserve1] = await pairContract.getReserves();
        
            // If token0 is not WETH, swap the reserves
            if (token0 !== WETH_ADDRESS) {
                [reserve0, reserve1] = [reserve1, reserve0];
            }
        
            reserveWETH = reserve0;  // now reserve0 is always for WETH
            reserveToken = reserve1;
            current_price = ethers.utils.formatEther(reserve0) / ethers.utils.formatEther(reserve1);
        }
        
        return {
            ...metadata,
            address: tokenAddress,
           // pairAddress,
          //  reserve0: reserveWETH ? parseFloat(ethers.utils.formatEther(reserveWETH)) : '0', // Convert Wei to Ether for WETH
          //  reserve1: reserveToken ? parseFloat(ethers.utils.formatUnits(reserveToken, metadata.decimals)) : '0', // Convert Wei to regular units using token's decimals
            current_price: current_price ? current_price : '0', 
            balances: tokenFullDetails ? tokenFullDetails.balances : [],
            creator_address: tokenFullDetails ? tokenFullDetails.creator_address : null

        };
    }));

    return allTokenDetails;
}
export async function getPairForAllPrivateSync(pairAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi) {

    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);

    const resultData = {
        liquidity_providers: []
    };

    try {
        const holdersData = await getAllTokenHolders(pairAddress, provider, uniswap_pair_abi);
        const filteredHolders = holdersData.filter(holder => holder.address !== pairAddress);


        const reserves  = await pair.getReserves();
        resultData.reserve0 = parseFloat(ethers.utils.formatEther(reserves._reserve0));

        resultData.reserve1 = parseFloat(ethers.utils.formatEther(reserves._reserve1));

        // Process liquidity providers from the holdersData
        const totalSupply = await pair.totalSupply();

        for (const holder of filteredHolders) {
            const holderAddress = holder.address;
            const lptokens = await pair.balanceOf(holder.address);
            const balance = parseFloat(ethers.utils.formatEther(lptokens));

            const proportion = balance / totalSupply;
            const tokenABalance = proportion * reserves._reserve0;
            const tokenBBalance = proportion * reserves._reserve1;

            resultData.liquidity_providers.push({
                owner_address: holderAddress,
                liquidity_tokens: balance,
                token0_added: tokenABalance,
                token1_added: tokenBBalance
            });
        }

        return { status: '200', data: resultData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}
export async function getAllPairsForAllPrivateSync() {
    //const { network, provider } = await initializeReadOnlyProvider(dbURLTestNet);
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { uniswap_pair_abi, simple_token_abi, MINT_VALUELINK_ADDRESS, UNISWAP_FACTORY_ADDRESS, BLOCK_HEIGHT, WETH_ADDRESS, uniswap_factory_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS } = getConstantsForNetwork(network);

    let events, token0Addresses, token1Addresses, pairAddresses;

    const iface1 = new ethers.utils.Interface(["event PairCreated(address indexed tokenA, address indexed tokenB, address pair)"]);
    const iface2 = new ethers.utils.Interface(["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"]);
    const iface3 = new ethers.utils.Interface(["event TokenCreated(address indexed token, address indexed owner)"]);
    const iface4 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);


    if (network === 'private') {
    // Fetch logs and parse them
        const logsFromContract1 = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
        const logsFromContract2 = await fetchEvents(provider, UNISWAP_FACTORY_ADDRESS, iface2, 'PairCreated(address,address,address,uint256)', BLOCK_HEIGHT);

        // Combine the logs
        let combinedEvents = logsFromContract1.concat(logsFromContract2);
        
        // Filter out events with the excluded address
        combinedEvents = combinedEvents.filter(event => event.args[0]);
        token0Addresses = combinedEvents.map(event => event.args[0]);  // tokenA or token0
        token1Addresses = combinedEvents.map(event => event.args[1]);  // tokenB or token1
        pairAddresses = combinedEvents.map(event => event.args[2]);    // pair
    } else {
        const event1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
       // const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface4, 'TokenCreated(address,address)', BLOCK_HEIGHT);
       // const events3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface4, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        const tokenevents = await Promise.all([event1 ]);        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...tokenevents); 
        const tokenAddresses = combinedEvents.map(event => event.args[0]); 
        // Fetch pair addresses for each token when paired with ETH and their corresponding token0 and token1
        const ethPairs = await Promise.all(tokenAddresses.map(async tokenAddress => {
            const pairAddress = await getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS);
            
            // Fetch token0 and token1 for the pairAddress
            const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
            const token0 = await pairContract.token0();
            const token1 = await pairContract.token1();

            return { pairAddress, token0, token1 };
        }));
        
        const pairCreatedEvents = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
        const pairAddressesFromPairCreated = pairCreatedEvents.map(event => event.args[2]);
        const token0AddressesFromPairCreated = pairCreatedEvents.map(event => event.args[0]);
        const token1AddressesFromPairCreated = pairCreatedEvents.map(event => event.args[1]);
        
        // Merge the data
        pairAddresses = [...pairAddressesFromPairCreated, ...ethPairs.map(ep => ep.pairAddress)];
        token0Addresses = [...token0AddressesFromPairCreated, ...ethPairs.map(ep => ep.token0)];
        token1Addresses = [...token1AddressesFromPairCreated, ...ethPairs.map(ep => ep.token1)];
        
    }
    const allTokens = await getAllTokensForAllPrivateSync();
const tokenPriceMapping = {};
allTokens.forEach(token => {
    tokenPriceMapping[token.address.toLowerCase()] = token.current_price;
});

    const allPairDetails = await Promise.all(pairAddresses.map(async (pairAddress, index) => {
        let token0Price = tokenPriceMapping[token0Addresses[index].toLowerCase()] || '0';
let token1Price = tokenPriceMapping[token1Addresses[index].toLowerCase()] || '0';

    const token0Metadata = await getTokenMetaData(token0Addresses[index], simple_token_abi, provider);
    const token1Metadata = await getTokenMetaData(token1Addresses[index], simple_token_abi, provider);
        // Check if token0 or token1 is WETH and replace name with 'ETH'
        let token0Name = token0Addresses[index].toLowerCase() === WETH_ADDRESS.toLowerCase() ? 'ETH' : token0Metadata.name;
        let token1Name = token1Addresses[index].toLowerCase() === WETH_ADDRESS.toLowerCase() ? 'ETH' : token1Metadata.name;
    

    let reserveToken0, reserveToken1;
    if (pairAddress && pairAddress !== ethers.constants.AddressZero) {
        const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
        const token0 = await pairContract.token0();
        [reserveToken0, reserveToken1] = await pairContract.getReserves();
                    // If token0 is not reserve0, swap the reserves
                    if (token0.toLowerCase() !== token0Addresses[index].toLowerCase()) {
                        [reserveToken0, reserveToken1] = [reserveToken1, reserveToken0];
                    }
                                        // If token1 is WETH_ADDRESS, swap the tokens and reserves
                    if (token1Addresses[index].toLowerCase() === WETH_ADDRESS.toLowerCase()) {
                        [token0Name, token1Name] = [token1Name, token0Name];
                        [reserveToken0, reserveToken1] = [reserveToken1, reserveToken0];
                        [token0Price, token1Price] = [token1Price, token0Price];
                        [token0Addresses[index], token1Addresses[index]] = [token1Addresses[index], token0Addresses[index]];
                    }
    
    }
    // Call the getPairForAll function
    const pairLiquidityDetails = await getPairForAllPrivateSync(pairAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi);

    return {
        token0: token0Name,
        token1: token1Name,
        token0Address: token0Addresses[index],
        token1Address: token1Addresses[index],
        pairAddress,
        current_price_token0: parseFloat(token1Price),
        current_price_token1: parseFloat(token1Price),
        TVL: parseFloat(parseFloat(ethers.utils.formatEther(reserveToken0)) * token0Price + parseFloat(ethers.utils.formatUnits(reserveToken1)) * token1Price),
        reserveToken0: parseFloat(ethers.utils.formatEther(reserveToken0)),
        reserveToken1: parseFloat(ethers.utils.formatUnits(reserveToken1)),
        liquidity_providers: pairLiquidityDetails.data.liquidity_providers 
        };
    }));

    return allPairDetails;
}


/////get all pairs and tokens
export async function getAllTokensForAll() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);

    const iface = new ethers.utils.Interface(["event LiquidityAdded(address,address)"]);
    const iface2 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);
    const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
    
    let events, tokenAddresses;
    if (network === 'private') {
        const privateEvents1 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents2 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents5 = fetchEvents(provider, QUEST_FACTORY_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        // Wait for both fetches to complete
        events = await Promise.all([privateEvents5, privateEvents1, privateEvents2]);
    
        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events);
    
        tokenAddresses = combinedEvents.map(event => event.args[0]);
    } else {
        const events1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        events = await Promise.all([events1, events2]);

        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events); 

        tokenAddresses = combinedEvents.map(event => event.args[0]); 
    }
    const allTokenDetails = await Promise.all(tokenAddresses.map(async tokenAddress => {
        const tokenFullDetails = await getTokenForAll(tokenAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi);
        const metadata = await getTokenMetaData(tokenAddress, simple_token_abi, provider);

        const pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);
        
        let reserveToken, reserveWETH, current_price;
        if (pairAddress && pairAddress !== ethers.constants.AddressZero) {
            const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
            const token0 = await pairContract.token0();
            let [reserve0, reserve1] = await pairContract.getReserves();
        
            // If token0 is not WETH, swap the reserves
            if (token0 !== WETH_ADDRESS) {
                [reserve0, reserve1] = [reserve1, reserve0];
            }
        
            reserveWETH = reserve0;  // now reserve0 is always for WETH
            reserveToken = reserve1;
            current_price = ethers.utils.formatEther(reserve0) / ethers.utils.formatEther(reserve1);
        }
        
        return {
            ...metadata,
            address: tokenAddress,
            pairAddress,
            reserve0: reserveWETH ? parseFloat(ethers.utils.formatEther(reserveWETH)) : '0', // Convert Wei to Ether for WETH
            reserve1: reserveToken ? parseFloat(ethers.utils.formatUnits(reserveToken, metadata.decimals)) : '0', // Convert Wei to regular units using token's decimals
            current_price: current_price ? current_price : '0', 
            balances: tokenFullDetails ? tokenFullDetails.balances : [],
            creator_address: tokenFullDetails ? tokenFullDetails.creator_address : null

        };
    }));
            // Create the mapping of token names to their addresses
            const tokenNameToAddressMapping = {};
            for (const tokenDetail of allTokenDetails) {
                tokenNameToAddressMapping[tokenDetail.name] = tokenDetail.address;
            }
        
            // Store the mapping in the browser's local storage
            localStorage.setItem('tokenNameToAddressMapping', JSON.stringify(tokenNameToAddressMapping));
            

    return allTokenDetails;
}
export async function getAllPairsForAll() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { uniswap_pair_abi, simple_token_abi, MINT_VALUELINK_ADDRESS, UNISWAP_FACTORY_ADDRESS, BLOCK_HEIGHT, WETH_ADDRESS, uniswap_factory_abi } = getConstantsForNetwork(network);

    let events, token0Addresses, token1Addresses, pairAddresses;

    const iface1 = new ethers.utils.Interface(["event PairCreated(address indexed tokenA, address indexed tokenB, address pair)"]);
    const iface2 = new ethers.utils.Interface(["event PairCreated(address indexed token0, address indexed token1, address pair, uint)"]);

    if (network === 'private') {
    // Fetch logs and parse them
        const logsFromContract1 = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
        const logsFromContract2 = await fetchEvents(provider, UNISWAP_FACTORY_ADDRESS, iface2, 'PairCreated(address,address,address,uint256)', BLOCK_HEIGHT);

        // Combine the logs
        let combinedEvents = logsFromContract1.concat(logsFromContract2);
        
        // Filter out events with the excluded address
        combinedEvents = combinedEvents.filter(event => event.args[0] !== WETH_ADDRESS && event.args[1] !== WETH_ADDRESS);
        token0Addresses = combinedEvents.map(event => event.args[0]);  // tokenA or token0
        token1Addresses = combinedEvents.map(event => event.args[1]);  // tokenB or token1
        pairAddresses = combinedEvents.map(event => event.args[2]);    // pair
    } else {
        events = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);

        token0Addresses = events.map(event => event.args[0]);  // tokenA or token0
        token1Addresses = events.map(event => event.args[1]);  // tokenB or token1
        pairAddresses = events.map(event => event.args[2]); 
    }
    const allPairDetails = await Promise.all(pairAddresses.map(async (pairAddress, index) => {
    const token0Metadata = await getTokenMetaData(token0Addresses[index], simple_token_abi, provider);
    const token1Metadata = await getTokenMetaData(token1Addresses[index], simple_token_abi, provider);

    let reserveToken0, reserveToken1;
    if (pairAddress && pairAddress !== ethers.constants.AddressZero) {
        const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
        const token0 = await pairContract.token0();
        [reserveToken0, reserveToken1] = await pairContract.getReserves();
                    // If token0 is not reserve0, swap the reserves
                    if (token0.toLowerCase() !== token0Addresses[index].toLowerCase()) {
                        [reserveToken0, reserveToken1] = [reserveToken1, reserveToken0];
                    }
    }
    // Call the getPairForAll function
    const pairLiquidityDetails = await getPairForAll(pairAddress, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi);

    return {
        token0: token0Metadata.name,
        token1: token1Metadata.name,
        token0Address: token0Addresses[index],
        token1Address: token1Addresses[index],
        pairAddress,
        reserveToken0: reserveToken0 ? parseFloat(ethers.utils.formatUnits(reserveToken0), '18') : '0',
        reserveToken1: reserveToken1 ? parseFloat(ethers.utils.formatUnits(reserveToken1, '18')) : '0',
        liquidity_providers: pairLiquidityDetails.data.liquidity_providers 
        };
    }));

    const pairNameToAddressMapping = {};
    for (const pairDetail of allPairDetails) {
        pairNameToAddressMapping[pairDetail.token0.name + ' - ' + pairDetail.token1.name] = pairDetail.pairAddress;
    }
    
    // Store the mapping in the browser's local storage
    localStorage.setItem('pairNameToAddressMapping', JSON.stringify(pairNameToAddressMapping));

    return allPairDetails;
}
