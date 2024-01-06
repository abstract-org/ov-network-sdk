import * as ethers from 'ethers';

export async function getReservesAtBlock(pairAddress, blockNumber, uniswap_pair_abi, WETH_ADDRESS, provider) {
    const pair = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
    const reserves = await pair.getReserves({
        blockTag: blockNumber
    });
    let wethReserve, tokenReserve;
    if ((await pair.token0()) === WETH_ADDRESS) {
        wethReserve = reserves[0];
        tokenReserve = reserves[1];
    } else {
        wethReserve = reserves[1];
        tokenReserve = reserves[0];
    }

    return {
        blockNumber: blockNumber,
        reserves0: ethers.utils.formatEther(wethReserve),
        reserves1: ethers.utils.formatEther(tokenReserve),
        price: wethReserve / tokenReserve
    };
}