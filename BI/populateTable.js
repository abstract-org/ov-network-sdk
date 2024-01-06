import { fetchData } from "../get_utilities/fetchData";
import { transactionBI } from '../requests/getTokenPriceHistory';
import { initializeProviderFromCurrentNetwork } from "../network_utilities/provider";
import { getConstantsForNetwork } from "../network_utilities/getConstants";
import { fetchEvents } from '../get_utilities/fetchEvents';
import { getTokenBlockchain } from '../serverOps/send2server';
import { switchNetwork } from "../network_utilities/utils";
import { getWalletTokens } from "../requests/getWallet";
import { getTokenStats } from '../requests/getAllTokens';
import * as ethers from 'ethers';


export async function populateTables(currentPage = 1) {
    try {
        // Fetch the JSON data from the file
        const response = await fetch('./json/json_data_data_2023-09-18T16-59-45.155Z.json');
        const data = await response.json();

        const itemsPerPage = 5;
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        const paginatedTokens = data.slice(start, end);

        // Get the table body element for token pairs
        const tableBodyPairs = document.querySelector('#tokenPairsTable tbody');

        // Populate the table for token pairs
        data.forEach(entry => {
            entry.valuelinks.forEach(valuelink => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${valuelink.pairAddress}</td>
                    <td>${valuelink.TVL}</td>
                    <td>${valuelink.token0_data ? valuelink.token0_data.name : "N/A"}</td>
                    <td>${valuelink.token1_data ? valuelink.token1_data.name : "N/A"}</td>
                    <td>${valuelink.reserve0}</td>
                    <td>${valuelink.reserve1}</td>
                `;
                tableBodyPairs.appendChild(row);
            });
        });

        // Get the table body element for tokens
        const tableBodyTokens = document.querySelector('#tokenDataTable tbody');

        // Use Promise.all to handle fetching historical data for the paginated tokens simultaneously
        const historyPromises = paginatedTokens.map(async (token) => {
            let historyData;
            try {
                historyData = await fetchData('transaction/query?quest=' + token.content);
            } catch (error) {
                if (error.status === 404) {
                    historyData = await transactionBI(token.token_address); 
                } else {
                    throw error;
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${token.content}</td>
                <td>${token.token_address}</td>
                <td>${token.creator_address}</td>
                <td>${token.current_price}</td>
                <td>${token.current_price * 1800}</td>
                <td>${token.reserve0}</td>
                <td>${token.reserve1}</td>
            `;
            tableBodyTokens.appendChild(row);

            return historyData;
        });

        // Await all history data fetching to complete
        await Promise.all(historyPromises);

        const totalPages = Math.ceil(data.length / itemsPerPage);
        const paginationElement = document.querySelector('#pagination');

        paginationElement.innerHTML = ''; // Clear previous pagination
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.innerText = i.toString();
            pageButton.onclick = () => populateTables(i);
            paginationElement.appendChild(pageButton);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}



async function getTokenActivity(token) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { simple_token_abi } = getConstantsForNetwork(network);

    const contract = new ethers.Contract(token.token_address, simple_token_abi, provider);
    
    const activityCount = {};
    let latestBlock = 0;

    const transferFilter = contract.filters.Transfer(null, null);
    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: token.token_address,
        topics: transferFilter.topics
    });

    logs.forEach(log => {
        const decoded = contract.interface.parseLog(log);
        const fromAddress = decoded.args.from;
        const toAddress = decoded.args.to;

        activityCount[fromAddress] = (activityCount[fromAddress] || 0) + 1;
        activityCount[toAddress] = (activityCount[toAddress] || 0) + 1;

        // Update the latestBlock if this log's block number is higher
        if (log.blockNumber > latestBlock) {
            latestBlock = log.blockNumber;
        }
    });

    // Combine the total activity and the latest block for this token
    const totalActivity = Object.values(activityCount).reduce((a, b) => a + b, 0);

    return {
        name: token.content,
        contractAddress: token.token_address,
        totalActivity,
        latestBlock
    };
}

export async function analyzeTokensActivity() {
    const response = await fetch('./json/json_data_data_2023-09-18T16-59-45.155Z.json');
const data = await response.json();
    const activityPromises = data.map(token => getTokenActivity(token));
    const activities = await Promise.all(activityPromises);

    // Sort by total activity
    const sortedByActivity = [...activities].sort((a, b) => b.totalActivity - a.totalActivity);
    console.log("Tokens sorted by activity:", sortedByActivity);

    // Sort by most recent activity
    const sortedByRecency = [...activities].sort((a, b) => b.latestBlock - a.latestBlock);
    console.log("Tokens sorted by recency:", sortedByRecency);
}


// ... [previous code]

async function getTokenTransactionFrequencies(token) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { simple_token_abi } = getConstantsForNetwork(network);
    const contract = new ethers.Contract(token.token_address, simple_token_abi, provider);

    const blockFrequencies = {};
    const transferFilter = contract.filters.Transfer(null, null);
    const logs = await provider.getLogs({
        fromBlock: 0,
        toBlock: 'latest',
        address: token.token_address,
        topics: transferFilter.topics
    });

    logs.forEach(log => {
        const blockNumber = log.blockNumber;
        blockFrequencies[blockNumber] = (blockFrequencies[blockNumber] || 0) + 1;
    });

    return {
        name: token.content,
        frequencies: blockFrequencies
    };
}

export async function plotTransactionFrequencies() {
    const response = await fetch('./json/json_data_data_2023-09-18T16-59-45.155Z.json');
    const data = await response.json();

    const frequencyPromises = data.map(token => getTokenTransactionFrequencies(token));
    const frequencies = await Promise.all(frequencyPromises);
console.log(frequencies);
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const blockNumbers = [];
    const datasets = frequencies.map(tokenFreq => {
        const tokenBlockNumbers = Object.keys(tokenFreq.frequencies).map(Number).sort((a, b) => a - b);
        const tokenFrequencies = tokenBlockNumbers.map(blockNum => tokenFreq.frequencies[blockNum]);
console.log(tokenBlockNumbers);
        blockNumbers.push(...tokenBlockNumbers);

        return {
            label: tokenFreq.name,
            data: tokenFrequencies,
            borderColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Random color
            fill: false
        };
    });

 //   const uniqueBlockNumbers = Array.from(new Set(blockNumbers)).sort((a, b) => a - b);

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: blockNumbers,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                        ticks: {
                            maxTicksLimit: 50 
                }}
            }
        }
    });
}



export async function plotTokenPricesOverTime() {
    const response = await fetch('./json/json_data_data_2023-09-18T16-59-45.155Z.json');
    const data = await response.json();

    const pricePromises = data.map(token => transactionBI(token.token_address));
    const pricesData = await Promise.all(pricePromises);
    console.log(pricesData);
    
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const timestamps = [];
    const datasets = pricesData.map((tokenData, index) => {
        const tokenName = data[index].content; // Using content from the initial JSON to get the token name
        const tokenTimestamps = tokenData.map(tx => new Date(tx.timestamp * 1000)); // Convert UNIX timestamp to Date
        const tokenPrices = tokenData.map(tx => tx.current_price_token1);
        timestamps.push(...tokenTimestamps);

        return {
            label: tokenName,
            data: tokenPrices,
            borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
            fill: false
        };
    });
    const allPriceData = [];

    for (let token of data) {
        const prices = await transactionBI(token.token_address);
        allPriceData.push({ tokenName: token.content, prices: prices });
    }

    // Saving the data as JSON
    downloadJSON(allPriceData, 'token_prices.json');

    const uniqueTimestamps = Array.from(new Set(timestamps)).sort((a, b) => a - b);

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: uniqueTimestamps,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    position: 'bottom',
                    ticks: {
                        maxTicksLimit: 50,
                        autoSkip: true
                    }
                }
            }
        }
    });
}


function downloadJSON(data, filename = 'data.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
}


export async function plotTokenPricesOverTimeFromJSON() {
    const response = await fetch('./token_prices.json');
    const tokenDataArray = await response.json();

    // Get all unique days
    let allDaysSet = new Set();
    tokenDataArray.forEach(tokenData => {
        tokenData.prices.forEach(priceData => {
            const day = priceData.timestamp.split("T")[0];  // Extract the day from the timestamp
            allDaysSet.add(day);
        });
    });
    const allDays = [...allDaysSet].sort();

    let networkIndexData = Array(allDays.length).fill(0); // Initialize with zeros for each day

    const datasets = tokenDataArray.map(tokenData => {
        let lastKnownPrice = null;
        const data = allDays.map((day, idx) => {
            const priceOnDay = tokenData.prices.find(priceData => priceData.timestamp.startsWith(day));
            if (priceOnDay) {
                lastKnownPrice = priceOnDay.current_price_token1 * 1800;
            }
            // Sum the price for the network index
            networkIndexData[idx] += lastKnownPrice || 0;
            return lastKnownPrice;  // Return last known price if no price for that day
        });

        return {
            label: tokenData.tokenName,
            data: data,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            fill: false
        };
    });

    // Add the network index to the datasets
    datasets.push({
        label: 'Network Index',
        data: networkIndexData,
        borderColor: '#000000',  // Black color for the index
        fill: false,
        borderWidth: 2  // Making it a bit thicker to stand out
    });

    // Plot the data using Chart.js.
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: allDays,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    position: 'bottom',
                    time: {
                        parser: 'YYYY-MM-DD',
                        unit: 'day'
                    }
                },
                y: {
                    type: 'logarithmic',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return value !== 0 ? value : null;
                        }
                    }
                }
            }
        }
    });
}

let viewLast24Hours = false; // Global state variable

export function toggleChartView() {
    viewLast24Hours = !viewLast24Hours; // Toggle the view state

    const toggleButton = document.getElementById('toggleView');
    if (viewLast24Hours) {
        toggleButton.textContent = "Toggle to Daily Average";
    } else {
        toggleButton.textContent = "Toggle to Hourly Details";
    }

    // Determine which plotting function to call based on the toggle switch
    const isWalletData = document.getElementById('dataToggle').checked;
    if (isWalletData) {
        plotTokenPricesUnifiedWallet();
    } else {
        plotTokenPricesUnified();
    }
}

let myChart = null;

export async function plotTokenPricesUnified() {
    // 1. Fetch token addresses
    logToDiv('reading blockchain countdown:');
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);

    const iface = new ethers.utils.Interface(["event LiquidityAdded(address,address)"]);
    const iface2 = new ethers.utils.Interface(["event TokenCreated(address,address)"]);
    const iface3 = new ethers.utils.Interface(["event TokenCreated(address indexed token, address indexed owner)"]);

    const factory = new ethers.Contract(UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, provider);
    
    let events, tokenAddresses, tokenStats;
    if (network === 'sepolia') {
        const privateEvents1 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents2 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        const privateEvents5 = fetchEvents(provider, QUEST_FACTORY_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
        // Wait for both fetches to complete
        events = await Promise.all([privateEvents5, privateEvents1, privateEvents2]);
    
        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events);
    
        tokenAddresses = combinedEvents.map(event => event.args[0]);
    } else {
        const events1 = fetchEvents(provider, MINT_QUEST_ADDRESS, iface3, 'TokenCreated(address,address)', BLOCK_HEIGHT);
      //  const events2 = fetchEvents(provider, OLD_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);
      //  const events3 = fetchEvents(provider, OLDEST_MINT_QUEST_ADDRESS, iface2, 'TokenCreated(address,address)', BLOCK_HEIGHT);

        events = await Promise.all([events1]);

        // Concatenate the results to get a single list of events
        const combinedEvents = [].concat(...events); 

        tokenAddresses = combinedEvents.map(event => event.args[0]); 
        const lowercaseTokenAddresses = tokenAddresses.map(address => address.toLowerCase());

        tokenStats = await getTokenStats(lowercaseTokenAddresses);
        
    }
    console.log(tokenStats);
    console.log(tokenAddresses);
    logToDiv('3');
    // 2. Use token addresses to get price data over time
    const pricePromises = tokenAddresses.map(tokenAddress => transactionBI(tokenAddress));
    const pricesData = await Promise.all(pricePromises);
    logToDiv('2');
    const tokenDetailsPromises = tokenAddresses.map(tokenAddress => getTokenBlockchain(tokenAddress, network, provider));
const tokensDetails = await Promise.all(tokenDetailsPromises);
logToDiv('1');
// Populate the tokenDataTable in HTML
const tokenTableBody = document.getElementById('tokenDataTable').querySelector('tbody');
tokenTableBody.innerHTML = '';  // clear the existing rows

tokensDetails.forEach(detail => {
    // Find the corresponding token data from tokenStats
    const tokenStat = tokenStats.find(stat => stat.name === detail.content);
    const ETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
    // Extract individual token data
    if (tokenStat) {
        // Calculate individual token market cap, assuming the structure of tokenStat
        let tokenMarketCap = 0;
        for (const pair of tokenStat.pairBase) {
            const tokenReserve = pair.token0.id === ETH_ADDRESS ? pair.reserve1 : pair.reserve0;
            tokenMarketCap += tokenReserve * pair.token1Price;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${detail.content || tokenStat.name}</td>
            <td>${detail.token_address}</td>
            <td>${detail.creator_address}</td>
            <td>${detail.reserve0}</td>
            <td>${detail.reserve1}</td>
            <td>${tokenStat.totalLiquidity}</td>
            <td>${detail.valuelinks.length}</td>
            <td>${tokenStat.tradeVolume}</td>
            <td>${tokenStat.txCount}</td>
            <td>${tokenMarketCap.toFixed(2)}</td> 
        `;
        tokenTableBody.appendChild(row);
    }
});

    // Instead of saving to a file, just prepare the data array directly for plotting
    const tokenDataArray = tokensDetails.map((tokenDetail, index) => ({
        tokenDetails: tokenDetail,
        prices: pricesData[index],
        current_price: pricesData[index][pricesData[index].length - 1]?.current_price || 0 
    }));
    function sortTokenData(sortBy) {
        if (sortBy === 'price') {
            return tokenDataArray.sort((a, b) => b.current_price - a.current_price);  // Sort descending by price
        } else if (sortBy === 'alphabetical') {
            return tokenDataArray.sort((a, b) => a.tokenDetails.content.localeCompare(b.tokenDetails.content));
        } else {
            return tokenDataArray;  // Default unsorted
        }
    }
    const sortedTokenData = sortTokenData('price');  // Or 'alphabetical'
    
    const now = Date.now();

    const isWithinLast24Hours = timestamp => {
        const oneDayInMillis = 24 * 60 * 60 * 1000;
        return now - new Date(timestamp).getTime() <= oneDayInMillis;
    };
    
    let timeSet = new Set();
    
    sortedTokenData.forEach(tokenData => {
        tokenData.prices.forEach(priceData => {
            let timeIdentifier;
            if (viewLast24Hours) {
                timeIdentifier = (new Date(priceData.timestamp)).toISOString().slice(0, -5); // Hourly granularity
            } else {
                timeIdentifier = (new Date(priceData.timestamp)).toISOString().split("T")[0]; // Daily granularity
            }
            timeSet.add(timeIdentifier);
        });
    });
    
    const timeLabels = [...timeSet].sort();
    
    let networkIndexData = Array(timeLabels.length).fill(0);  // <-- Use timeLabels instead of allDays
    
    const datasets = sortedTokenData.map(tokenData => {
        let lastKnownPrice = null;
        const data = timeLabels.map((time, idx) => {  // <-- Use timeLabels instead of allDays
            const priceAtTime = tokenData.prices.find(priceData => (new Date(priceData.timestamp)).toISOString().startsWith(time));  // <-- Use time instead of day
            if (priceAtTime) {
                lastKnownPrice = priceAtTime.current_price_token1 * 2000;
            }
            networkIndexData[idx] += lastKnownPrice || 0;
            return lastKnownPrice;
        });

        return {
            label: tokenData.tokenDetails.content,
            data: data,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            fill: false
        };
    });

    // Add the network index to the datasets
    datasets.push({
        label: 'Network Index',
        data: networkIndexData,
        borderColor: '#000000',
        fill: false,
        borderWidth: 2
    });

    // 3. Plot the data using Chart.js
    const canvas = document.getElementById('tokenTransactionChart');


    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    position: 'bottom',
                    time: {
                        parser: true,  // This will let Chart.js automatically determine the format
                        unit: viewLast24Hours ? 'hour' : 'day',  // Use hour for last 24 hours, day for all time
                        displayFormats: {
                            hour: 'YYYY-MM-DD HH:mm',
                            day: 'YYYY-MM-DD'
                        }
                    }
                },
                y: {
                   // type: 'logarithmic',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return value !== 0 ? value : null;
                        }
                    }
                }
            }
        }
    });
    
}
function logToDiv(message) {
    const logDiv = document.getElementById('consoleLogs');
    logDiv.textContent += message + '\n';

    // Auto-scroll to bottom
    logDiv.scrollTop = logDiv.scrollHeight;
}


export async function plotTokenPricesUnifiedWallet() {
    // 1. Fetch token addresses
    logToDiv('reading blockchain countdown:');
    const { network, provider, account } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, QUEST_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, MINT_QUEST_ADDRESS, OLD_MINT_QUEST_ADDRESS, OLDEST_MINT_QUEST_ADDRESS, BLOCK_HEIGHT } = getConstantsForNetwork(network);
    // 1. Fetch token details from the wallet
    const walletData = await getWalletTokens(account); 
    const tokensDetailsWallet = walletData.data.owned_tokens;
    logToDiv('3');
    // Fetch additional details for each token using getTokenBlockchain
    const tokenAddresses = tokensDetailsWallet.map(detail => detail.token_address);
    const tokenDetailsPromises = tokenAddresses.map(tokenAddress => getTokenBlockchain(tokenAddress));
    const tokensDetails = await Promise.all(tokenDetailsPromises);
    logToDiv('2');
    // 2. Use token details to get price data over time
    const pricePromises = tokenAddresses.map(tokenAddress => transactionBI(tokenAddress));
    const pricesData = await Promise.all(pricePromises);
    logToDiv('1');
    // Populate the tokenDataTable in HTML
    const tokenTableBody = document.getElementById('tokenDataTable').querySelector('tbody');
    tokenTableBody.innerHTML = '';  // clear the existing rows
    tokensDetails.forEach((detail, index) => {
        const row = document.createElement('tr');
        const contentURL = `https://staging.openvalue.xyz/#quest=${detail.content}`;
        const scanURL = `https://${network}.etherscan.io/token/${detail.token_address}`
        row.innerHTML = `
            <td><a href="${contentURL}" target="_blank">${detail.content}</a></td>
            <td><a href="${scanURL}" target="_blank">${detail.token_address}</td>
            <td>${detail.creator_address}</td>
            <td>${tokensDetailsWallet[index].current_price}</td>
            <td>${tokensDetailsWallet[index].current_price * 1800}</td>
            <td>${detail.reserve0}</td>
            <td>${detail.reserve1}</td>
            <td>${tokensDetailsWallet[index].balance}</td>
            <td>${detail.valuelinks.length}</td>
        `;
        tokenTableBody.appendChild(row);
    });
    // Instead of saving to a file, just prepare the data array directly for plotting
    const tokenDataArray = tokensDetails.map((tokenDetail, index) => ({
        tokenDetails: tokenDetail,
        prices: pricesData[index],
        current_price: pricesData[index][pricesData[index].length - 1]?.current_price || 0 
    }));
    function sortTokenData(sortBy) {
        if (sortBy === 'price') {
            return tokenDataArray.sort((a, b) => b.current_price - a.current_price);  // Sort descending by price
        } else if (sortBy === 'alphabetical') {
            return tokenDataArray.sort((a, b) => a.tokenDetails.content.localeCompare(b.tokenDetails.content));
        } else {
            return tokenDataArray;  // Default unsorted
        }
    }
    const sortedTokenData = sortTokenData('price');  // Or 'alphabetical'
    
    const now = Date.now();

    const isWithinLast24Hours = timestamp => {
        const oneDayInMillis = 24 * 60 * 60 * 1000;
        return now - new Date(timestamp).getTime() <= oneDayInMillis;
    };
    
    let timeSet = new Set();
    
    sortedTokenData.forEach(tokenData => {
        tokenData.prices.forEach(priceData => {
            let timeIdentifier;
            if (viewLast24Hours) {
                timeIdentifier = (new Date(priceData.timestamp)).toISOString().slice(0, -5); // Hourly granularity
            } else {
                timeIdentifier = (new Date(priceData.timestamp)).toISOString().split("T")[0]; // Daily granularity
            }
            timeSet.add(timeIdentifier);
        });
    });
    
    const timeLabels = [...timeSet].sort();
    
    let networkIndexData = Array(timeLabels.length).fill(0);  // <-- Use timeLabels instead of allDays
    
    const datasets = sortedTokenData.map(tokenData => {
        let lastKnownPrice = null;
        const data = timeLabels.map((time, idx) => {  // <-- Use timeLabels instead of allDays
            const priceAtTime = tokenData.prices.find(priceData => (new Date(priceData.timestamp)).toISOString().startsWith(time));  // <-- Use time instead of day
            if (priceAtTime) {
                lastKnownPrice = priceAtTime.current_price_token1 * 1800;
            }
            networkIndexData[idx] += lastKnownPrice || 0;
            return lastKnownPrice;
        });

        return {
            label: tokenData.tokenDetails.content,
            data: data,
            borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
            fill: false
        };
    });

    // Add the network index to the datasets
    datasets.push({
        label: 'Network Index',
        data: networkIndexData,
        borderColor: '#000000',
        fill: false,
        borderWidth: 2
    });

    // 3. Plot the data using Chart.js
    const canvas = document.getElementById('tokenTransactionChart');


    if (myChart) {
        myChart.destroy();
    }
    
    myChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: datasets
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    position: 'bottom',
                    time: {
                        parser: true,  // This will let Chart.js automatically determine the format
                        unit: viewLast24Hours ? 'hour' : 'day',  // Use hour for last 24 hours, day for all time
                        displayFormats: {
                            hour: 'YYYY-MM-DD HH:mm',
                            day: 'YYYY-MM-DD'
                        }
                    }
                },
                y: {
                    type: 'logarithmic',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value, index, values) {
                            return value !== 0 ? value : null;
                        }
                    }
                }
            }
        }
    });
    
}

export async function connectToBI() {
    const selectedNetwork = document.getElementById('networkSelection').value;
    const result = await switchNetwork(selectedNetwork);
    const data = await getWalletAddressBI();
    const provider = data.provider;
    // Handle the result, update the DOM
    if (result.status === '200') {
        document.getElementById('currentNetwork').textContent = selectedNetwork;
        document.getElementById('walletAddress').textContent = data.walletAddress;
        
        const balanceun = await provider.getBalance(data.walletAddress); 
        const balance = ethers.utils.formatEther(balanceun);
        document.getElementById('walletBalance').textContent = balance;

        document.getElementById('walletInfo').style.display = 'block';
    } else {
        console.error('Failed to connect:', result.data);
        // Maybe show an error to the user
    }
}
async function getWalletAddressBI() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const walletAddress = await signer.getAddress();
    return { provider, walletAddress }
  }