import * as ethers from 'ethers';

export async function isContract(address, provider) {
    const code = await provider.getCode(address);
    return code && code !== '0x';
}