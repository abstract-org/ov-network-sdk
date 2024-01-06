import { fetchData } from '../get_utilities/fetchData';
import { getHolders, getAllTokenHolders } from '../external_api_calls/getHolders';
import { isPair } from '../get_utilities/isPair';
import { getPairAddress } from '../get_utilities/getPairAddress';
import { isContract } from '../get_utilities/isContract';
import { getReserves } from '../get_utilities/getReserves';
import { getConstantsForNetwork } from '../network_utilities/getConstants';
import { initializeProviderFromCurrentNetwork, initializeReadOnlyProvider } from '../network_utilities/provider';
import * as ethers from 'ethers';

export async function getBlockchainDetailsTokenBackUp(tokenAddress, backendData) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi, uniswap_pair_bytecode } = getConstantsForNetwork(network);

    try {
        const [holdersData, pairAddress] = await Promise.all([
            getHolders(tokenAddress),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS)
        ]);
        const { updatedAt, items } = holdersData;
        // Determine the most recent timestamp from backendData's balances array
        let latestBackendTimestamp = new Date(0);  // Initialize to earliest possible date

        backendData.balances.forEach(balanceEntry => {
            const currentTimestamp = new Date(`${balanceEntry.timestamp}Z`);
            if (currentTimestamp > latestBackendTimestamp) {
                latestBackendTimestamp = currentTimestamp;
            }
        });

        // Convert holdersData's updated_at to Date object
        const holdersUpdatedDate = new Date(updatedAt);

        // Check if holdersData is outdated compared to the most recent backendData timestamp
        if (holdersUpdatedDate <= latestBackendTimestamp) {
            return { status: '200', data: backendData };  // Return backendData if it's more recent
        }

        const filteredHolders = items.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());

        backendData.balances = backendData.balances || [];
        backendData.valuelinks = backendData.valuelinks || [];

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractHolders = [];
        const nonContractHolders = [];
        filteredHolders.forEach((holder, index) => {
            (contractResults[index] ? contractHolders : nonContractHolders).push(holder);
        });

        const reserveData = await getReserves(provider, uniswap_pair_abi, pairAddress);
        if (reserveData) {
            const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
            const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
            
            if (reserveData.token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
                backendData.reserve0 = parseFloat(reserve0);
                backendData.reserve1 = parseFloat(reserve1);
            } else {
                backendData.reserve0 = parseFloat(reserve1);
                backendData.reserve1 = parseFloat(reserve0);
            }

            backendData.current_price = backendData.reserve0 / backendData.reserve1;
        }

        const valueLinksMap = new Map(backendData.valuelinks.map(v => [v.pair_address.toLowerCase(), v]));
        for (let holder of contractHolders) {
            const holderAddress = holder.address.toLowerCase();
            let balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            let existingValueLink = valueLinksMap.get(holderAddress);
        
            let tokenName = 'outside contract';
            if (await isPair(holderAddress, provider)) {
            try {
                const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                const name = await token.name();
                
                if (name === 'Uniswap V2') {
                    const token0Address = await token.token0();
                    const token1Address = await token.token1();
                    const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                    const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                    const token0Name = await token0.name();
                    const token1Name = await token1.name();
                    if (token0Address !== tokenAddress) {
                        tokenName = 'PAIR: ' + token0Name;
                    } else if (token1Address !== tokenAddress) {
                        tokenName = 'PAIR: ' + token1Name;
                    } else {
                        // This should technically not occur, as one of them should always match the holderAddress.
                        tokenName = 'outside contract';
                    }

                } else {
                    tokenName = name;
                }
            } catch {
                tokenName = 'outside contract'; 
            }
        }
                backendData.balances.push({
                    owner_address: tokenName + ' ' + holderAddress,
                    balance: parseFloat(balance)
                });
            
        }

        const balancesMap = new Map(backendData.balances.map(b => [b.owner_address.toLowerCase(), b]));
        for (let holder of nonContractHolders) {
            const holderAddress = holder.address.toLowerCase();
            let balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            let existingBalance = balancesMap.get(holderAddress);

            if (existingBalance) {
                if (existingBalance.balance !== parseFloat(balance)) {
                    existingBalance.balance = parseFloat(balance);
                }
            } else {
                backendData.balances.push({
                    owner_address: 'WALLET: ' + holderAddress,
                    balance: parseFloat(balance)
                });
            }
        }
        backendData.balances.sort((a, b) => b.balance - a.balance);
        return { status: '200', data: backendData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}

export async function getBlockchainDetailsToken(tokenAddress) {
    const { network, provider } = await initializeProviderFromCurrentNetwork();
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    // Fetch backend data
    let backendData = await fetchData('quest/query?content=' + tokenAddress);
    if (backendData.status !== '200' || !backendData.data) {
        // Default structure if token data doesn't exist in the backend
        console.log('not found');
        backendData = {
            balances: [],
            valuelinks: []
        };
    } else {
        backendData = backendData.data;
    }

    try {
        const [holdersData, pairAddress] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS)
        ]);
console.log('2');
        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());
        backendData.balances = backendData.balances || [];
        backendData.valuelinks = backendData.valuelinks || [];

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractAddressPromises = filteredHolders.map(async (holder, index) => {
            if (!contractResults[index]) return null;

            const holderAddress = holder.address.toLowerCase();
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);

            let tokenName = 'outside contract';
            if (await isPair(holderAddress, provider)) {
                const token = new ethers.Contract(holderAddress, uniswap_pair_abi, provider);
                const [name, token0Address, token1Address] = await Promise.all([token.name(), token.token0(), token.token1()]);

                const token0 = new ethers.Contract(token0Address, simple_token_abi, provider);
                const token1 = new ethers.Contract(token1Address, simple_token_abi, provider);
                const [token0Name, token1Name] = await Promise.all([token0.name(), token1.name()]);

                tokenName = (name === 'Uniswap V2')
                    ? (token0Address !== tokenAddress) ? 'PAIR: ' + token0Name : 'PAIR: ' + token1Name
                    : name;
            }
            return {
                owner_address: tokenName + ' ' + holderAddress,
                balance: parseFloat(balance)
            };
        });

        const contractAddresses = await Promise.all(contractAddressPromises);
console.log('3');
        backendData.balances.push(...contractAddresses.filter(Boolean));

        // Handle non-contract holders
        const balancesMap = new Map(backendData.balances.map(b => [b.owner_address.toLowerCase(), b]));
        for (let holder of filteredHolders.filter((_, index) => !contractResults[index])) {
            const holderAddress = holder.address.toLowerCase();
            const balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            const existingBalance = balancesMap.get(holderAddress);

            if (existingBalance) {
                if (existingBalance.balance !== parseFloat(balance)) {
                    existingBalance.balance = parseFloat(balance);
                }
            } else {
                backendData.balances.push({
                    owner_address: 'WALLET: ' + holderAddress,
                    balance: parseFloat(balance)
                });
            }
        }

        // Handle reserve data
        const reserveData = await getReserves(provider, uniswap_pair_abi, pairAddress);
        if (reserveData) {
            const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
            const reserve1 = ethers.utils.formatEther(reserveData.reserve1);

            if (reserveData.token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
                backendData.reserve0 = parseFloat(reserve0);
                backendData.reserve1 = parseFloat(reserve1);
            } else {
                backendData.reserve0 = parseFloat(reserve1);
                backendData.reserve1 = parseFloat(reserve0);
            }

            backendData.current_price = backendData.reserve0 / backendData.reserve1;
        }

        backendData.balances.sort((a, b) => b.balance - a.balance);
        return { status: '200', data: backendData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}



export async function getBlockchainDetailsTokenHybrid(tokenAddress, backendData, currentDBURL) {
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    const { WETH_ADDRESS, UNISWAP_FACTORY_ADDRESS, uniswap_factory_abi, uniswap_pair_abi, simple_token_abi } = getConstantsForNetwork(network);

    try {
        const [holdersData, pairAddress] = await Promise.all([
            getAllTokenHolders(tokenAddress, provider, simple_token_abi),
            getPairAddress(provider, uniswap_factory_abi, UNISWAP_FACTORY_ADDRESS, tokenAddress, WETH_ADDRESS)
        ]);
        const filteredHolders = holdersData.filter(holder => holder.address.toLowerCase() !== pairAddress.toLowerCase());
        backendData.balances = backendData.balances || [];
        backendData.valuelinks = backendData.valuelinks || [];

        const contractResults = await Promise.all(filteredHolders.map(holder => isContract(holder.address, provider)));

        const contractHolders = [];
        const nonContractHolders = [];
        filteredHolders.forEach((holder, index) => {
            (contractResults[index] ? contractHolders : nonContractHolders).push(holder);
        });

        const reserveData = await getReserves(provider, uniswap_pair_abi, pairAddress);
        if (reserveData) {
            const reserve0 = ethers.utils.formatEther(reserveData.reserve0);
            const reserve1 = ethers.utils.formatEther(reserveData.reserve1);
            
            if (reserveData.token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase()) {
                backendData.reserve0 = parseFloat(reserve0);
                backendData.reserve1 = parseFloat(reserve1);
            } else {
                backendData.reserve0 = parseFloat(reserve1);
                backendData.reserve1 = parseFloat(reserve0);
            }

            backendData.current_price = backendData.reserve0 / backendData.reserve1;
        }

        const valueLinksMap = new Map(backendData.valuelinks.map(v => [v.pair_address.toLowerCase(), v]));
        for (let holder of contractHolders) {
            const holderAddress = holder.address.toLowerCase();
            let balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            let existingValueLink = valueLinksMap.get(holderAddress);

            if (existingValueLink) {
                if (existingValueLink.balance !== parseFloat(balance)) {
                    existingValueLink.balance = parseFloat(balance);
                }
            } else {
                backendData.balances.push({
                    owner_address: "outside_contract" + holderAddress,
                    balance: parseFloat(balance)
                });
            }
        }

        const balancesMap = new Map(backendData.balances.map(b => [b.owner_address.toLowerCase(), b]));
        for (let holder of nonContractHolders) {
            const holderAddress = holder.address.toLowerCase();
            let balance = parseFloat(ethers.utils.formatEther(holder.balance)).toFixed(5);
            let existingBalance = balancesMap.get(holderAddress);

            if (existingBalance) {
                if (existingBalance.balance !== parseFloat(balance)) {
                    existingBalance.balance = parseFloat(balance);
                }
            } else {
                backendData.balances.push({
                    owner_address: holderAddress,
                    balance: parseFloat(balance)
                });
            }
        }
        backendData.balances.sort((a, b) => b.balance - a.balance);
        return { status: '200', data: backendData };

    } catch (error) {
        console.error("Error fetching blockchain data:", error);
        return {};
    }
}



