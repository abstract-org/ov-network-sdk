import * as ethers from 'ethers';

export async function getTokenMetaData(tokenAddress, simple_token_abi, provider) {
    const token = new ethers.Contract(tokenAddress, simple_token_abi, provider);
    let name, symbol;
    
    try {
        name = await token.name();
    } catch {
        //console.error(`Failed to fetch name for token at address ${tokenAddress}:`, error);
        name = "Unknown Token";
    }

    try {
        symbol = await token.symbol();
    } catch {
        //console.error(`Failed to fetch symbol for token at address ${tokenAddress}:`, error);
        symbol = "UNKNOWN";
    }

    return { tokenAddress, name, symbol };
}
