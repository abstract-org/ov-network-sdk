import * as ethers from 'ethers';

export async function getReserves(provider, uniswap_pair_abi, pairAddress) {
    const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
    
    try {
        const reserves = await pairContract.getReserves();
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();

        return {
            reserve0: reserves[0],  
            reserve1: reserves[1],  
            token0Address,
            token1Address
        };
    } catch (error) {

      //  console.error(`Error fetching reserves for pairAddress ${pairAddress}`, error);
        return null;
    }
}


export async function getReservesETH(provider, uniswap_pair_abi, pairAddress, WETH_ADDRESS) {
    const pairContract = new ethers.Contract(pairAddress, uniswap_pair_abi, provider);
    
    try {
        let [reserve0, reserve1] = await pairContract.getReserves();
        const token0Address = await pairContract.token0();
        const token1Address = await pairContract.token1();

            // If token0 is not WETH, swap the reserves
            if (token0Address !== WETH_ADDRESS) {
                [reserve0, reserve1] = [reserve1, reserve0];
            }
        
            const reserveWETH = reserve0;  // now reserve0 is always for WETH
            const reserveToken = reserve1;

        return {
            reserve0: reserveWETH,
            reserve1: reserveToken,
            token0Address,
            token1Address
        };
    } catch (error) {

      //  console.error(`Error fetching reserves for pairAddress ${pairAddress}`, error);
        return null;
    }
}
