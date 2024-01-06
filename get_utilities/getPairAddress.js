import * as ethers from 'ethers';

export async function getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, token1, token2) {
    const factoryContract = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
    return await factoryContract.getPair(token1, token2);
}