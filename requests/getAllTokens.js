import { getTokenMetaData } from '../get_utilities/getTokenMetaData'
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { graphAPI } from '../external_api_calls/apiKeys';
import { fetchEvents } from '../get_utilities/fetchEvents';
import fetch from 'node-fetch';
import * as ethers from 'ethers';

export async function getAllTokens(network, provider, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, OLDEST_MINT_QUEST_ADDRESS) {

    const iface = new ethers.utils.Interface(["event LiquidityAdded(address,address)"]);
    const iface2 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);
    const iface3 = new ethers.utils.Interface(["event TokenCreated(address indexed token, address indexed owner)"]);
    
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
    } else if (network === 'sepolia'){
        const events1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const events3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)',  BLOCK_HEIGHT);
        
        events = await Promise.all([events1, events2, events3]);        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events); 
        tokenAddresses = combinedEvents.map(event => event.args[0]); 
    } else {
        const events1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
      //  const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
     //   const events3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)',  BLOCK_HEIGHT);
        
        events = await Promise.all([events1]);        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events); 
        tokenAddresses = combinedEvents.map(event => event.args[0]); 
    }
    const allTokenDetails = await Promise.all(tokenAddresses.map(async tokenAddress => {
        const metadata = await getTokenMetaData(tokenAddress, simple_token_abi, provider);

        const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
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
            reserve0: reserveWETH ? ethers.utils.formatEther(reserveWETH) : '0', // Convert Wei to Ether for WETH
            reserve1: reserveToken ? ethers.utils.formatUnits(reserveToken, metadata.decimals) : '0', // Convert Wei to regular units using token's decimals
            current_price: current_price ? current_price : '0', 
        };
    }));
        // Send token details to the server endpoint
      //  await sendTokensToServer(allTokenDetails);
            // Create the mapping of token names to their addresses
            const tokenNameToAddressMapping = {};
            for (const tokenDetail of allTokenDetails) {
                tokenNameToAddressMapping[tokenDetail.name] = tokenDetail.address;
            }
        
            // Store the mapping in the browser's local storage
            localStorage.setItem(`${network}-tokenNameToAddressMapping`, JSON.stringify(tokenNameToAddressMapping));
            

    return allTokenDetails;
}

async function sendTokensToServer(tokens) {
    const tokenData = tokens.map(token => ({
        name: token.name,
        address: token.address
    }));

    try {
        const response = await fetch('https://ovmain.ue.r.appspot.com/store-tokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tokenData)
        });

        if (!response.ok) {
            throw new Error('Failed to send token data to the server');
        }

        const responseData = await response.json();
        console.log('Server response:', responseData);
    } catch (error) {
        console.error('Error sending token data to the server:', error);
    }
}


export async function getAllTokenAddresses() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { MINT_QUEST_ADDRESS, mint_quest_abi } = getConstantsForNetwork(network);

    const ovTokenBaseContract = new ethers.Contract(MINT_QUEST_ADDRESS, mint_quest_abi, provider);
    
    // Fetch the total token count
    const tokenCount = await ovTokenBaseContract.getTokenCount();
    
    // Retrieve each token's address using the contract's public array
    const tokenAddresses = [];
    for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await ovTokenBaseContract.tokens(i);
        tokenAddresses.push(tokenAddress);
    }
    
    return tokenAddresses; // This array is what you would use for your graph query
}

const GRAPHQL_ENDPOINT = `https://gateway-arbitrum.network.thegraph.com/api/${graphAPI}/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum`;

export async function getTokenStats(tokenAddresses) {
    const query = `
        query GetTokenData($tokenIds: [ID!]!) {
            tokens(where: {id_in: $tokenIds}) {
                derivedETH
                name
                id
                symbol
                totalLiquidity
                totalSupply
                tradeVolume
                txCount
                tokenDayData {
                    dailyVolumeETH
                  }
                pairBase {
                  token0 {
                    name
                    id
                  }
                  token1 {
                    name
                    id
                  }
                  reserve0
                  reserve1
                  reserveETH
                  token0Price
                  token1Price
                }
              }
            }`;

    const variables = {
        tokenIds: tokenAddresses
    };

    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    if (!response.ok) {
        // If the HTTP response is not ok, throw an error
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    const data = await response.json();
   // console.log(data);

    if (data.errors) {
        // If The Graph's response contains errors, throw an error
        throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
    }

    return data.data.tokens;
}

  

export async function getSummaryData() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { MINT_QUEST_ADDRESS, mint_quest_abi } = getConstantsForNetwork(network);

    const ovTokenBaseContract = new ethers.Contract(MINT_QUEST_ADDRESS, mint_quest_abi, provider);
    const tokenCount = await ovTokenBaseContract.getTokenCount();
    let tokenAddresses = [];
    for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await ovTokenBaseContract.tokens(i);
        tokenAddresses.push(tokenAddress.toLowerCase()); // Convert to lowercase to match The Graph query format
    }
    //console.log(tokenAddresses);
    // Now we have all token addresses, we can get the stats
  //  const tokenAddresses = await getAllTokenAddresses(); // Fetch the token addresses from the contract
    const tokenStats = await getTokenStats(tokenAddresses); // Fetch the token stats from The Graph
    let marketCaps = [];
    let numValueLinks = 0;
    let numQuests = 0;
    let totalEth = 0;
    let totalVolume = 0;
    let totalTx = 0;
    let totalVolumeEth = 0;
  //console.log('step2');
    const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
  
    for (const token of tokenStats) {
        const tokenVolume = parseFloat(token.tradeVolume); // Parse the tradeVolume string as a float
        const tokenTx = parseFloat(token.txCount);
        totalTx += tokenTx;
        totalVolume += tokenVolume;
    
        for (const day of token.tokenDayData) {
            const ethVolume = parseFloat(day.dailyVolumeETH)
            totalVolumeEth += ethVolume;
        }
    
        // For each token, process its pairBase data
        for (const pair of token.pairBase) {
            const isEthPair = pair.token0.id === ETH_ADDRESS || pair.token1.id === ETH_ADDRESS;
            if (isEthPair) {
                numQuests += 1;
                const ethReserve = parseFloat(pair.reserveETH);
    
                let tokenReserve, marketCap;
                if (pair.token0.id === ETH_ADDRESS) {
                    // ETH is token0, so the reserve of the token is in token1
                 //   tokenReserve = pair.reserve1;
                    marketCap = 10000 * pair.token0Price; // Market Cap calculated using token1Price
                } else {
                    // ETH is token1, so the reserve of the token is in token0
                  //  tokenReserve = pair.reserve0;
                    marketCap = 10000 * pair.token1Price; // Market Cap calculated using token0Price
                }
    
                marketCaps.push(marketCap);
                totalEth += ethReserve;
            } else {
                numValueLinks += 1;
                // Calculate market cap based on both reserves and prices
               // const marketCap = pair.reserve0 * pair.token1Price;
               // marketCaps.push(marketCap);
            }
        }
    }
 // console.log('ok');
    const totalMarketCap = marketCaps.reduce((acc, cap) => acc + cap, 0);
    const formattedTotalEth = totalEth;
    const formattedMarketCap = totalMarketCap;
  
    return {
        total_market_cap: formattedMarketCap,
      number_of_valuelinks: numValueLinks,
      number_of_quests: numQuests,
      total_eth: formattedTotalEth,
      total_token_volume: totalVolume,
      total_tx: totalTx,
      total_eth_volume: totalVolumeEth
    };
}

export async function getSummaryDataOffline(network, provider) {
    const { MINT_QUEST_ADDRESS, mint_quest_abi } = getConstantsForNetwork(network);
    const ovTokenBaseContract = new ethers.Contract(MINT_QUEST_ADDRESS, mint_quest_abi, provider);
    const tokenCount = await ovTokenBaseContract.getTokenCount();
    let tokenAddresses = [];
    for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await ovTokenBaseContract.tokens(i);
        tokenAddresses.push(tokenAddress.toLowerCase()); // Convert to lowercase to match The Graph query format
    }
    //console.log(tokenAddresses);
    // Now we have all token addresses, we can get the stats
  //  const tokenAddresses = await getAllTokenAddresses(); // Fetch the token addresses from the contract
    const tokenStats = await getTokenStats(tokenAddresses); // Fetch the token stats from The Graph
    
    let marketCaps = [];
    let numValueLinks = 0;
    let numQuests = 0;
    let totalEth = 0;
    let totalVolume = 0;
    let totalTx = 0;
    let totalVolumeEth = 0;
  //console.log('step2');
    const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
  
    for (const token of tokenStats) {
        const tokenVolume = parseFloat(token.tradeVolume); // Parse the tradeVolume string as a float
        const tokenTx = parseFloat(token.txCount);
        totalTx += tokenTx;
        totalVolume += tokenVolume;
    
        for (const day of token.tokenDayData) {
            const ethVolume = parseFloat(day.dailyVolumeETH)
            totalVolumeEth += ethVolume;
        }
    
        // For each token, process its pairBase data
        for (const pair of token.pairBase) {
            const isEthPair = pair.token0.id === ETH_ADDRESS || pair.token1.id === ETH_ADDRESS;
            if (isEthPair) {
                numQuests += 1;
                const ethReserve = parseFloat(pair.reserveETH);
    
                let tokenReserve, marketCap;
                if (pair.token0.id === ETH_ADDRESS) {
                    // ETH is token0, so the reserve of the token is in token1
                 //   tokenReserve = pair.reserve1;
                    marketCap = 10000 * pair.token0Price; // Market Cap calculated using token1Price
                } else {
                    // ETH is token1, so the reserve of the token is in token0
                  //  tokenReserve = pair.reserve0;
                    marketCap = 10000 * pair.token1Price; // Market Cap calculated using token0Price
                }
    
                marketCaps.push(marketCap);
                totalEth += ethReserve;
            } else {
                numValueLinks += 1;
                // Calculate market cap based on both reserves and prices
               // const marketCap = pair.reserve0 * pair.token1Price;
               // marketCaps.push(marketCap);
            }
        }
    }
 // console.log('ok');
    const totalMarketCap = marketCaps.reduce((acc, cap) => acc + cap, 0);
    const formattedTotalEth = totalEth;
    const formattedMarketCap = totalMarketCap;
  
    return {
        total_market_cap: formattedMarketCap,
      number_of_valuelinks: numValueLinks,
      number_of_quests: numQuests,
      total_eth: formattedTotalEth,
      total_token_volume: totalVolume,
      total_tx: totalTx,
      total_eth_volume: totalVolumeEth
    };
}




function findTokenCurrentPrice(tokenAddress, tokenStats, ETH_ADDRESS) {
    const tokenData = tokenStats.find(token => token.id.toLowerCase() === tokenAddress.toLowerCase());
    if (tokenData) {
        const ethPair = tokenData.pairBase.find(pair => pair.token0.id.toLowerCase() === ETH_ADDRESS || pair.token1.id.toLowerCase() === ETH_ADDRESS);
        let currentPrice = ethPair ? (ethPair.token0.id.toLowerCase() === ETH_ADDRESS ? ethPair.token0Price : ethPair.token1Price) : 0;

        return currentPrice
    }
    return 0;
}

export async function transformTokenStatsToQuestsFormat() {
    const pairsAndTokensData = await fetchPairsAndTokens();
    const tokenAddresses = extractTokenAddresses(pairsAndTokensData);

    const tokenStats = await getTokenStats(tokenAddresses);
    const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

    const transformedData = tokenStats.map(token => {
        let ethPair = token.pairBase.find(pair => pair.token0.id.toLowerCase() === ETH_ADDRESS || pair.token1.id.toLowerCase() === ETH_ADDRESS);
        let currentPrice = ethPair ? (ethPair.token0.id.toLowerCase() === ETH_ADDRESS ? ethPair.token0Price : ethPair.token1Price) : 0;

        const valuelinks = token.pairBase.map(pair => {
            let token0Data = { token_address: '', content: '', current_price: 0 };
            let token1Data = { token_address: '', content: '', current_price: 0 };

            let TVL
            let isEthPair = pair.token0.id.toLowerCase() === ETH_ADDRESS || pair.token1.id.toLowerCase() === ETH_ADDRESS;

            if (isEthPair) {
                let ethToken = pair.token0.id.toLowerCase() === ETH_ADDRESS ? pair.token0 : pair.token1;
                let otherToken = pair.token0.id.toLowerCase() === ETH_ADDRESS ? pair.token1 : pair.token0;
                TVL = parseFloat(pair.reserveETH);

                token0Data = {
                    content: 'ETH',
                    creator_address: 'me', // Placeholder for creator address
                    current_price: ethToken.id.toLowerCase() === ETH_ADDRESS ? otherToken.token1Price : otherToken.token0Price,
                    token_address: ETH_ADDRESS
                };

                token1Data = {
                    content: otherToken.name,
                    creator_address: 'me', // Placeholder for creator address
                    current_price: otherToken.id.toLowerCase() === ETH_ADDRESS ? ethToken.token0Price : ethToken.token1Price,
                    token_address: otherToken.id
                };
            } else {
                let token0CurrentPrice = findTokenCurrentPrice(pair.token0.id, tokenStats, ETH_ADDRESS);
                let token1CurrentPrice = findTokenCurrentPrice(pair.token1.id, tokenStats, ETH_ADDRESS);
                TVL = parseFloat(pair.reserve0) * token0CurrentPrice + parseFloat(pair.reserve1) * token1CurrentPrice;
                token0Data = {
                    content: pair.token0.name,
                    creator_address: 'me',
                    current_price: token0CurrentPrice,
                    token_address: pair.token0.id
                };

                token1Data = {
                    content: pair.token1.name,
                    creator_address: 'me',
                    current_price: token1CurrentPrice,
                    token_address: pair.token1.id
                };
            
            }
            let token0Name = pair.token0.name === 'Wrapped Ether' ? 'ETH' : pair.token0.name;
            let token1Name = pair.token1.name === 'Wrapped Ether' ? 'ETH' : pair.token1.name;

            return {
                TVL: TVL.toString(),
                liquidity_providers: [
                    {
                        liquidity_tokens: parseFloat(pair.reserve1),
                        owner_address: 'me', // Placeholder for owner address
                        token0_added: parseFloat(pair.reserve0),
                        token1_added: parseFloat(pair.reserve1)
                    }
                ],
                token0: token0Data.token_address,
                token0_content: token0Data.content,
                token0_data: token0Data,
                token1: token1Data.token_address,
                token1_content: token1Data.content,
                token1_data: token1Data
            };
        });
        

        return {
            content: token.name,
            creator_address: 'me', // Modify as needed
            current_price: currentPrice.toString(),
            token_address: token.id,
            valuelinks: valuelinks
        };
    });

    return {
        data: transformedData,
        status: '200'
    };
}


async function fetchPairsAndTokens() {

    const pairsAndTokensQuery = `
  query MyQuery {
    pairs {
      token0Name
      token1Name
      tokenA
      tokenB
      id
    }
    tokens {
      id
      name
    }
  }
`;
    const response = await fetch('https://api.studio.thegraph.com/proxy/53594/names/v0.0.8', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: pairsAndTokensQuery
        })
    });

    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.errors) {
        throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
    }

    return data.data;
}

function extractTokenAddresses(pairsAndTokensData) {
    if (!pairsAndTokensData || !pairsAndTokensData.tokens) {
        console.error("Invalid data structure received", pairsAndTokensData);
        return [];
    }

    const tokenAddresses = pairsAndTokensData.tokens.map(token => token.id);

    return tokenAddresses;
}
