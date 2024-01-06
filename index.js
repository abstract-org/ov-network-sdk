window.global = window;
module.exports = {
//requests
...require('./requests/getAllTokens.js'),
...require('./requests/getAllPairs.js'),
...require('./requests/getDB.js'),
...require('./requests/getPair.js'),
...require('./requests/getToken.js'),
...require('./requests/getTokenPriceHistory.js'),
...require('./requests/getWallet.js'),
//network utilities
...require('./network_utilities/RPCconstants.js'),
//...require('./network_utilities/addNetwork.js'),
...require('./network_utilities/provider.js'),
...require('./network_utilities/eventHandler.js'),
...require('./network_utilities/getConstants.js'),
...require('./network_utilities/getWalletAddress.js'),
//...require('./network_utilities/connectNetwork.js'),
...require('./network_utilities/dbConstants.js'),
...require('./network_utilities/utils.js'),
//...require('./network_utilities/monitor.js'),
//...require('./network_utilities/setDBUrl.js'),
//...require('./network_utilities/switchNetwork.js'),
...require('./network_utilities/getBalance.js'),
//get utilities
...require('./get_utilities/getAddressFromIPFS.js'),
//...require('./get_utilities/fetchData.js'),
...require('./get_utilities/getEstimate.js'),
...require('./get_utilities/getTokenMetaData.js'),
...require('./get_utilities/fetchTokenTransfers.js'),
...require('./get_utilities/decodeLogs.js'),
...require('./get_utilities/getTimeStamp.js'),
...require('./get_utilities/getReservesAtBlock.js'),
...require('./get_utilities/getPairAddress.js'),
...require('./get_utilities/isContract.js'),
...require('./get_utilities/getReserves.js'),
...require('./get_utilities/fetchEvents.js'),
...require('./get_utilities/isPair.js'),
//external api
...require('./external_api_calls/getHolders.js'),
...require('./external_api_calls/getTokenBalance.js'),
...require('./external_api_calls/apiKeys.js'),
//constants
...require('./constants/private.js'),
...require('./constants/sepolia.js'),
//BI
...require('./BI/populateTable.js'),
//endpoints
...require('./serverOps/send2server.js'),
...require('./serverOps/data2Server.js'),
//...require('./serverOps/headers.js'),
...require('./endpoints.js'),
//blockchain transactions
...require('./blockchain_posts/buyToken.js'),
...require('./blockchain_posts/sellToken.js'),
...require('./blockchain_posts/mintQuest.js'),
...require('./blockchain_posts/mintVL.js'),
...require('./blockchain_posts/removeLiquidity.js'),
//...require('./other.js')
}
