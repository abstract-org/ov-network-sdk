import { dbURL, dbURLTestNet } from "../network_utilities/dbConstants";

export async function getTokenAddressFromIPFS(content, currentDBURL) {
    let url;
    if (currentDBURL === dbURLTestNet) {
        url = 'https://ipfs.io/ipfs/bafybeiezebf4sio57j7bqnalteg7zo3gktvxz75dyibfhhg2qfrynpesfa/json_data_data_2023-09-18T07-31-20.940Z.json';
    } else {
        // Use a separate URL for other cases
        url = 'https://ipfs.io/ipfs/bafybeia7adl6wtq4ozg2g6lgiw73btwrk26mwznlu3kpxsb45nv2cikr6u/json_data_data_2023-09-18T14-35-12.491Z.json';
    }

    const response = await fetch(url);
    const data = await response.json();
    const item = data.find(entry => entry.content.toLowerCase() === content.toLowerCase());
    return item ? item.token_address : null;
}


export function getTokenAddressByName(name, network) {
    const storedMapping = localStorage.getItem(`${network}-tokenNameToAddressMapping`);
    if (storedMapping) {
        const tokenMapping = JSON.parse(storedMapping);
        return tokenMapping[name];
    }
    return null;
}
