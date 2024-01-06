const GRAPHQL_ENDPOINT = 'https://api.studio.thegraph.com/proxy/53594/names/v0.0.8'; // Replace with your actual subgraph endpoint
export async function getPairData(token0Name, token1Name) {
  // Function to perform the GraphQL query
  async function queryPairData(variables) {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query GetPairData($token0Name: String!, $token1Name: String!) {
            pairs(where: {token0Name: $token0Name, token1Name: $token1Name}) {
              id
            }
          }
        `,
        variables
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(`GraphQL Error: ${data.errors.map(e => e.message).join('\n')}`);
    }

    return data;
  }

  try {
    // Try with the original order
    let data = await queryPairData({ token0Name, token1Name });
    
    // If no pairs found, try with the order reversed
    if (data.data.pairs.length === 0) {
      data = await queryPairData({ token0Name: token1Name, token1Name: token0Name });
      if (data.data.pairs.length === 0) {
        return { status: '202', message: 'No pairs found' };
      }
    }
    
    // If a pair is found, return the first one
    return { status: '200', data: data.data.pairs[0] };
  } catch {
   // console.error("Error fetching pair data:", error);
    return { status: '202', message: error.message };
  }
}


export async function getLink(source, target) {
  // Check if Ethereum is available
  if (!window.ethereum) {
    // Get the network and provider for a read-only operation
    const { network, provider } = await initializeReadOnlyProvider(currentDBURL);
    
    // Fetch pair data using the new getPairData function
    const pairDataResponse = await getPairData(source, target);
    if (pairDataResponse.status === '202') {
      // If no pair was found, return with status '202'
      return pairDataResponse;
    }
    if (pairDataResponse.status === '200') {
      const updatedData = await getPairBlockchainWebSocket(
        pairDataResponse.data.id, network, provider, source, target
      );
      return updatedData;
    }

  }

  // Check for Ethereum accounts
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  if (accounts.length === 0) {
    // If no accounts found, return an error or request to connect to MetaMask
    // This depends on how you want to handle this case in your application
    return { status: '403', message: 'No Ethereum accounts found. Please connect to MetaMask.' };
  }

  // Assuming the currentDBURL is not set to private, continue with getting blockchain details
  const { network, provider } = await initializeProviderFromCurrentNetwork();
  const pairDataResponse = await getPairData(source, target);

    if (pairDataResponse.status === '202') {
      // If no pair was found, return with status '202'
      return pairDataResponse;
    }
    if (pairDataResponse.status === '200') {
      const updatedData = await getPairBlockchain(
        pairDataResponse.data.id, network, provider, source, target
      );
      return { status: '200', data: updatedData };
    }
}
