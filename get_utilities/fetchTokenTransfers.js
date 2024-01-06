import * as ethers from 'ethers';

const TRANSFER_EVENT_SIGNATURE = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export async function fetchTokenTransfers(tokenAddress, provider, BLOCK_HEIGHT) {
    if (!tokenAddress) {
        throw new Error(`Token address not found for the provided token name: ${tokenAddress}`);
    }
    
    const logs = await provider.getLogs({
        fromBlock: BLOCK_HEIGHT,
        toBlock: 'latest',
        address: tokenAddress,
        topics: [TRANSFER_EVENT_SIGNATURE]
    });

    const uniqueLogs = [];

    const seenTransactionHashes = new Set();
    for (const log of logs) {
        if (!seenTransactionHashes.has(log.transactionHash)) {
            uniqueLogs.push(log);
            seenTransactionHashes.add(log.transactionHash);
        }
    }

    return uniqueLogs;
}
