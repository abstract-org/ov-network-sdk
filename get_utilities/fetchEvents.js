import * as ethers from 'ethers';

export async function fetchEvents(provider, contractAddress, iface, event, BLOCK_HEIGHT) {
    
    const filter = {
        address: contractAddress,
        fromBlock: BLOCK_HEIGHT,
        toBlock: 'latest',
        topics: [ethers.utils.id(event)]
    };

    const logs = await provider.getLogs(filter);
    const events = logs.map(log => iface.parseLog(log));

    return events;
}