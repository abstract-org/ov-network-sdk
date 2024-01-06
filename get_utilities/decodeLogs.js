import * as ethers from 'ethers';

export function decodeLogs(logs) {
    const iface = new ethers.utils.Interface([
        "event Transfer(address indexed from, address indexed to, uint256 value)"
    ]);
    
    return logs.map(log => iface.parseLog(log));
}
