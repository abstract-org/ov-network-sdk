import { getTokenMetaData } from '../get_utilities/getTokenMetaData'
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { fetchEvents } from '../get_utilities/fetchEvents';
import * as ethers from 'ethers';

export async function getAllPairs() {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const {  MINT_VALUELINK_ADDRESS, WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, BLOCK_HEIGHT, OLDEST_MINT_QUEST_ADDRESS, MINT_VALUELINK_ADDRESS_OLD, OLD_MINT_VALUELINK_ADDRESS } = getConstantsForNetwork(network);

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
    } else if (network === 'main') {
        const event1 = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
        const event2 = await fetchEvents(provider, OLD_MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
        let combinedEvents = event1.concat(event2);

        token0Addresses = combinedEvents.map(event => event.args[0]);  // tokenA or token0
        token1Addresses = combinedEvents.map(event => event.args[1]);  // tokenB or token1
        pairAddresses = combinedEvents.map(event => event.args[2]); 
    } else {
    const event1 = await fetchEvents(provider, MINT_VALUELINK_ADDRESS, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
    const event2 = await fetchEvents(provider, MINT_VALUELINK_ADDRESS_OLD, iface1, 'PairCreated(address,address,address)', BLOCK_HEIGHT);
    let combinedEvents = event1.concat(event2);

    token0Addresses = combinedEvents.map(event => event.args[0]);  // tokenA or token0
    token1Addresses = combinedEvents.map(event => event.args[1]);  // tokenB or token1
    pairAddresses = combinedEvents.map(event => event.args[2]); 
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

    return {
        token0: token0Metadata.name,
        token1: token1Metadata.name,
        token0Address: token0Addresses[index],  // Adding token0 address
        token1Address: token1Addresses[index],
        pairAddress,
        reserveToken0: reserveToken0 ? ethers.utils.formatUnits(reserveToken0, '18') : '0', // Convert Wei to regular units using token's decimals
        reserveToken1: reserveToken1 ? ethers.utils.formatUnits(reserveToken1, '18') : '0', // Convert Wei to regular units using token's decimals

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
