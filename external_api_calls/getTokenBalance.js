import { alchemySepoliaAPI, alchemyGoerliAPI, alchemyMainAPI } from './apiKeys';
import * as ethers from 'ethers';
import fetch from 'node-fetch';

export async function getTokenBalances(address, network) {
    // Select the appropriate API based on the network
    let alchemyAPI;
    switch (network) {
        case 'sepolia':
            alchemyAPI = alchemySepoliaAPI;
            break;
        case 'main':
            alchemyAPI = alchemyMainAPI;
            break;
        case 'goerli':
            alchemyAPI = alchemyGoerliAPI;
            break;
        default:
            throw new Error('Unsupported network');
    }

    const response = await fetch(alchemyAPI, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "id": 1,
            "jsonrpc": "2.0",
            "method": "alchemy_getTokenBalances",
            "params": [
                address,
                "erc20"
            ]
        })
    });

    const data = await response.json();
        // Checksum the token addresses
    const checksummedTokenBalances = data.result.tokenBalances.map(token => ({
        ...token,
        contractAddress: ethers.utils.getAddress(token.contractAddress)
    }));

    return checksummedTokenBalances;
}
