import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { API_KEY } from './apiKeys';
import * as ethers from 'ethers';


export async function getHolders(tokenAddress) {
    const endpoint = `https://api.covalenthq.com/v1/eth-sepolia/tokens/${tokenAddress}/token_holders_v2/`;
    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return {
        updatedAt: data.data.updated_at,
        items: data.data.items
    };
}



export async function getAllTokenHolders(contractAddress, provider, simple_token_abi) {

    const contract = new ethers.Contract(contractAddress, simple_token_abi, provider);

    let addressesSet = new Set();

    const transferFilter = contract.filters.Transfer(null, null);
    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: contractAddress,
        topics: transferFilter.topics
    });

    logs.forEach(log => {
        const decoded = contract.interface.parseLog(log);
        addressesSet.add(decoded.args.from);
        addressesSet.add(decoded.args.to);
    });

    const addresses = Array.from(addressesSet);
    const balances = {};
    // Generate array of promises for fetching balances in parallel
    const balancePromises = addresses.map(address => contract.balanceOf(address));
    const fetchedBalances = await Promise.all(balancePromises);

    // Convert the fetched balances array into a balances object
    for (let i = 0; i < addresses.length; i++) {
        balances[addresses[i]] = fetchedBalances[i].toString();
    }

    // Sort the balances in descending order
    const sortedBalances = Object.entries(balances).sort((a, b) => b[1] - a[1]);

    // Create an array of objects with address and balance properties
    const sortedBalancesArray = sortedBalances
        .filter(([address, balance]) => parseFloat(balance) !== 0 && address !== '0x0000000000000000000000000000000000000000')
        .map(([address, balance]) => ({ address, balance }));

    return sortedBalancesArray;
}

export async function getTokenTradeActivity(tokenAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { simple_token_abi } = getConstantsForNetwork(network);

    const contract = new ethers.Contract(tokenAddress, simple_token_abi, provider);

    const transferFilter = contract.filters.Transfer(null, null);
    let logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: tokenAddress,
        topics: transferFilter.topics
    });

    // Remove duplicate logs
    const uniqueLogsMap = new Map();

    logs.forEach(log => {
        uniqueLogsMap.set(log.transactionHash, log);
    });
    
    logs = [...uniqueLogsMap.values()];

    let tokenOriginal = ethers.utils.parseEther("10000");
    const ethOriginal = ethers.utils.parseEther("0.05");

    const tradeActivities = [];

    for (const log of logs) {
        const sender = ethers.utils.getAddress('0x' + log.topics[1].slice(26));
        const recipient = ethers.utils.getAddress('0x' + log.topics[2].slice(26));
        const amount = ethers.BigNumber.from(log.data);
//console.log(ethers.utils.formatEther(amount));
        if (sender === tokenAddress) {
            tokenOriginal = tokenOriginal.sub(amount);
        } else if (recipient === tokenAddress) {
            tokenOriginal = tokenOriginal.add(amount);
        }

        const ethNew = ethOriginal.mul(tokenOriginal).div(ethOriginal.add(tokenOriginal));

        tradeActivities.push({
            sender,
            recipient,
            tokenAmount: ethers.utils.formatEther(amount),
            relatedEthAmount: ethers.utils.formatEther(ethNew)
        });
    }

    return tradeActivities;
}