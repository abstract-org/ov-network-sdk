import * as ethers from 'ethers';

export async function getTimestamp(blockNumber, provider) {
    const block = await provider.getBlock(blockNumber);
    const date = new Date(block.timestamp * 1000); // Convert to milliseconds by multiplying with 1000.
    const format = date.toISOString().slice(0,-1)
    return format  // Formats to "2023-08-28T10:29:16.090Z"
}