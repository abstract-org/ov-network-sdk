import { fetchTokenTransfers } from '../get_utilities/fetchTokenTransfers';
import { decodeLogs } from '../get_utilities/decodeLogs';
import { getTimestamp } from '../get_utilities/getTimeStamp';
import { getReservesAtBlock } from '../get_utilities/getReservesAtBlock';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork } from '../network_utilities/provider';
import * as ethers from 'ethers';

export async function transactionBI(tokenAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { UNISWAP_FACTORY_ADDRESS, uniswap_pair_abi, uniswap_factory_abi, WETH_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);
    const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
    const pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);
    try {
        const logs = await fetchTokenTransfers(tokenAddress, provider, BLOCK_HEIGHT);
        const decodedLogs = decodeLogs(logs);
        const blockNumbers = new Set();

        const promises = logs.map(async (log, i) => {
            const decodedLog = decodedLogs[i];

            // Fetch and decode the receipt
            const receipt = await provider.getTransactionReceipt(log.transactionHash);

            const hasExcludedEvent = receipt.logs.some(receiptLog => 
                receiptLog.topics.some(topic => EXCLUDED_TOPICS.includes(topic))
            );

            if (hasExcludedEvent) {
                return null;
            }


      let transferDetails = {
        from: decodedLog.args.from,
        to: decodedLog.args.to,
        value: ethers.utils.formatEther(decodedLog.args.value.toString()),
        timestamp: null,
        isOV: false,
        receipt: {
            blockHash: receipt.blockHash,
            blockNumber: receipt.blockNumber, 
            txHash: receipt.transactionHash,
            gasUsed: receipt.gasUsed,
            uniswapEvents: []
        }
    };
    const blockTimestamp = await getTimestamp(receipt.blockNumber, provider);
    transferDetails.timestamp = blockTimestamp;
        const blockHash = receipt.blockHash;
    const hasFilteredEvent = receipt.logs.some(receiptLog => 
        receiptLog.topics.some(topic => FILTERED_TOPICS.includes(topic))
    );

    if (hasFilteredEvent) {
        transferDetails.isOV = true;
    }
    blockNumbers.add(receipt.blockNumber);
            return transferDetails;
        

        return null;
    });

    const results = (await Promise.all(promises)).filter(res => res !== null);
    const reservesPromises = Array.from(blockNumbers).map(async blockNumber => {
        return getReservesAtBlock(pairAddress, blockNumber, uniswap_pair_abi, WETH_ADDRESS, provider);
    });
    
    const reservesResults = await Promise.all(reservesPromises);
    // Loop through each result (transfer) and insert reserves into its receipt data.
    for (let transfer of results) {
        const correspondingReserves = reservesResults.find(r => r.blockNumber === transfer.receipt.blockNumber);
        if (correspondingReserves) {
            transfer.reserves0 = correspondingReserves.reserves0;
            transfer.reserves1 = correspondingReserves.reserves1;
            transfer.current_price_token1 = correspondingReserves.price
        }
    }
    
  //  console.log(JSON.stringify(results, null, 2));
  //  console.log(reservesResults);
return results;
} catch (error) {
    console.error("Error in upkeep:", error.message);
}
}


const EXCLUDED_TOPICS = [
    //  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LiquidityAdded(address,address)")),
     // ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PairCreated(address,address,address)")),
    //  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TokensPurchased(address,address,uint256,uint256)")),
    //  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TokensSold(address,address,uint256,uint256)")),
    //  ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LiquidityAdded(address,address,uint256,uint256)")),
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RemainderTransferred(address,address,uint256)"))
  ];
  
  // Define the event signatures you want to exclude
  const FILTERED_TOPICS = [
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LiquidityAdded(address,address)")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PairCreated(address,address,address)")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TokensPurchased(address,address,uint256,uint256)")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("TokensSold(address,address,uint256,uint256)")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("LiquidityAdded(address,address,uint256,uint256)")),
        ethers.utils.keccak256(ethers.utils.toUtf8Bytes("RemainderTransferred(address,address,uint256)"))
    ];


    export async function transactionBIOffline(tokenAddress, network, provider) {
        const { UNISWAP_FACTORY_ADDRESS, uniswap_pair_abi, uniswap_factory_abi, WETH_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);
        const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
        const pairAddress = await factory.getPair(tokenAddress, WETH_ADDRESS);
        try {
            const logs = await fetchTokenTransfers(tokenAddress, provider, BLOCK_HEIGHT);
            const decodedLogs = decodeLogs(logs);
            const blockNumbers = new Set();
    
            const promises = logs.map(async (log, i) => {
                const decodedLog = decodedLogs[i];
    
                // Fetch and decode the receipt
                const receipt = await provider.getTransactionReceipt(log.transactionHash);
    
                const hasExcludedEvent = receipt.logs.some(receiptLog => 
                    receiptLog.topics.some(topic => EXCLUDED_TOPICS.includes(topic))
                );
    
                if (hasExcludedEvent) {
                    return null;
                }
    
    
          let transferDetails = {
            from: decodedLog.args.from,
            to: decodedLog.args.to,
            value: ethers.utils.formatEther(decodedLog.args.value.toString()),
            timestamp: null,
            isOV: false,
            receipt: {
                blockHash: receipt.blockHash,
                blockNumber: receipt.blockNumber, 
                txHash: receipt.transactionHash,
                gasUsed: receipt.gasUsed,
                uniswapEvents: []
            }
        };
        const blockTimestamp = await getTimestamp(receipt.blockNumber, provider);
        transferDetails.timestamp = blockTimestamp;
            const blockHash = receipt.blockHash;
        const hasFilteredEvent = receipt.logs.some(receiptLog => 
            receiptLog.topics.some(topic => FILTERED_TOPICS.includes(topic))
        );
    
        if (hasFilteredEvent) {
            transferDetails.isOV = true;
        }
        blockNumbers.add(receipt.blockNumber);
                return transferDetails;
            
    
            return null;
        });
    
        const results = (await Promise.all(promises)).filter(res => res !== null);
        const reservesPromises = Array.from(blockNumbers).map(async blockNumber => {
            return getReservesAtBlock(pairAddress, blockNumber, uniswap_pair_abi, WETH_ADDRESS, provider);
        });
        
        const reservesResults = await Promise.all(reservesPromises);
        // Loop through each result (transfer) and insert reserves into its receipt data.
        for (let transfer of results) {
            const correspondingReserves = reservesResults.find(r => r.blockNumber === transfer.receipt.blockNumber);
            if (correspondingReserves) {
                transfer.reserves0 = correspondingReserves.reserves0;
                transfer.reserves1 = correspondingReserves.reserves1;
                transfer.current_price_token1 = correspondingReserves.price
            }
        }
        
      //  console.log(JSON.stringify(results, null, 2));
      //  console.log(reservesResults);
    return results;
    } catch (error) {
        console.error("Error in upkeep:", error.message);
    }
    }