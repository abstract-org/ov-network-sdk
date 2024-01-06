export const quest_factory_abi = [
{
"anonymous": false,
"inputs": [
{
"indexed": false,
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"indexed": false,
"internalType": "address",
"name": "owner",
"type": "address"
}
],
"name": "TokenCreated",
"type": "event"
},
{
"inputs": [
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
},
{
"internalType": "bytes32",
"name": "initCodeHash",
"type": "bytes32"
}
],
"name": "computeAddress",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "name",
"type": "string"
},
{
"internalType": "string",
"name": "symbol",
"type": "string"
},
{
"internalType": "uint256",
"name": "totalSupply",
"type": "uint256"
},
{
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
}
],
"name": "createToken",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "getTokenCount",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"name": "tokens",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
}
];
export const uniswap_factory_abi = [
{
"inputs": [
{
    "internalType": "address",
    "name": "_feeToSetter",
    "type": "address"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "token0",
    "type": "address"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "token1",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "address",
    "name": "pair",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"name": "PairCreated",
"type": "event"
},
{
"constant": true,
"inputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"name": "allPairs",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "allPairsLength",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "tokenA",
    "type": "address"
},
{
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
}
],
"name": "createPair",
"outputs": [
{
    "internalType": "address",
    "name": "pair",
    "type": "address"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "feeTo",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "feeToSetter",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
},
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"name": "getPair",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "_feeTo",
    "type": "address"
}
],
"name": "setFeeTo",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "_feeToSetter",
    "type": "address"
}
],
"name": "setFeeToSetter",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
}
];
export const simple_token_abi = [
{
"inputs": [
{
    "internalType": "string",
    "name": "name",
    "type": "string"
},
{
    "internalType": "string",
    "name": "symbol",
    "type": "string"
},
{
    "internalType": "uint256",
    "name": "totalSupply",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "_owner",
    "type": "address"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "Approval",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "from",
    "type": "address"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "Transfer",
"type": "event"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "owner",
    "type": "address"
},
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
}
],
"name": "allowance",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
}
],
"name": "approve",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "account",
    "type": "address"
}
],
"name": "balanceOf",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "decimals",
"outputs": [
{
    "internalType": "uint8",
    "name": "",
    "type": "uint8"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "subtractedValue",
    "type": "uint256"
}
],
"name": "decreaseAllowance",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "addedValue",
    "type": "uint256"
}
],
"name": "increaseAllowance",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "name",
"outputs": [
{
    "internalType": "string",
    "name": "",
    "type": "string"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "symbol",
"outputs": [
{
    "internalType": "string",
    "name": "",
    "type": "string"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "totalSupply",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
}
],
"name": "transfer",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "from",
    "type": "address"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "amount",
    "type": "uint256"
}
],
"name": "transferFrom",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"stateMutability": "nonpayable",
"type": "function"
}
];
export const uniswap_router_abi = [
{
"inputs": [
{
    "internalType": "address",
    "name": "_factory",
    "type": "address"
},
{
    "internalType": "address",
    "name": "_WETH",
    "type": "address"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"inputs": [],
"name": "WETH",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "tokenA",
    "type": "address"
},
{
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "amountADesired",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountBDesired",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountAMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountBMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "addLiquidity",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountA",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "token",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "amountTokenDesired",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountTokenMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "addLiquidityETH",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountToken",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
}
],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [],
"name": "factory",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveOut",
    "type": "uint256"
}
],
"name": "getAmountIn",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
}
],
"stateMutability": "pure",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveOut",
    "type": "uint256"
}
],
"name": "getAmountOut",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
}
],
"stateMutability": "pure",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
}
],
"name": "getAmountsIn",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
}
],
"name": "getAmountsOut",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountA",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveA",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "reserveB",
    "type": "uint256"
}
],
"name": "quote",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
}
],
"stateMutability": "pure",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "tokenA",
    "type": "address"
},
{
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountAMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountBMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "removeLiquidity",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountA",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "token",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountTokenMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "removeLiquidityETH",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountToken",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "token",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountTokenMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "removeLiquidityETHSupportingFeeOnTransferTokens",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "token",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountTokenMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
},
{
    "internalType": "bool",
    "name": "approveMax",
    "type": "bool"
},
{
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
},
{
    "internalType": "bytes32",
    "name": "r",
    "type": "bytes32"
},
{
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
}
],
"name": "removeLiquidityETHWithPermit",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountToken",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "token",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountTokenMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountETHMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
},
{
    "internalType": "bool",
    "name": "approveMax",
    "type": "bool"
},
{
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
},
{
    "internalType": "bytes32",
    "name": "r",
    "type": "bytes32"
},
{
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
}
],
"name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountETH",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "address",
    "name": "tokenA",
    "type": "address"
},
{
    "internalType": "address",
    "name": "tokenB",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountAMin",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountBMin",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
},
{
    "internalType": "bool",
    "name": "approveMax",
    "type": "bool"
},
{
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
},
{
    "internalType": "bytes32",
    "name": "r",
    "type": "bytes32"
},
{
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
}
],
"name": "removeLiquidityWithPermit",
"outputs": [
{
    "internalType": "uint256",
    "name": "amountA",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountB",
    "type": "uint256"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapETHForExactTokens",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactETHForTokens",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
"outputs": [],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactTokensForETH",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactTokensForTokens",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountIn",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountOutMin",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountInMax",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapTokensForExactETH",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
    "internalType": "uint256",
    "name": "amountOut",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amountInMax",
    "type": "uint256"
},
{
    "internalType": "address[]",
    "name": "path",
    "type": "address[]"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
}
],
"name": "swapTokensForExactTokens",
"outputs": [
{
    "internalType": "uint256[]",
    "name": "amounts",
    "type": "uint256[]"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"stateMutability": "payable",
"type": "receive"
}
];
export const uniswap_pair_abi = [
{
"inputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "owner",
    "type": "address"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "Approval",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "to",
    "type": "address"
}
],
"name": "Burn",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
}
],
"name": "Mint",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "sender",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0In",
    "type": "uint256"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1In",
    "type": "uint256"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount0Out",
    "type": "uint256"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "amount1Out",
    "type": "uint256"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "to",
    "type": "address"
}
],
"name": "Swap",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": false,
    "internalType": "uint112",
    "name": "reserve0",
    "type": "uint112"
},
{
    "indexed": false,
    "internalType": "uint112",
    "name": "reserve1",
    "type": "uint112"
}
],
"name": "Sync",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
    "indexed": true,
    "internalType": "address",
    "name": "from",
    "type": "address"
},
{
    "indexed": true,
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "indexed": false,
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "Transfer",
"type": "event"
},
{
"constant": true,
"inputs": [],
"name": "DOMAIN_SEPARATOR",
"outputs": [
{
    "internalType": "bytes32",
    "name": "",
    "type": "bytes32"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "MINIMUM_LIQUIDITY",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "PERMIT_TYPEHASH",
"outputs": [
{
    "internalType": "bytes32",
    "name": "",
    "type": "bytes32"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
},
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"name": "allowance",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "approve",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"name": "balanceOf",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "to",
    "type": "address"
}
],
"name": "burn",
"outputs": [
{
    "internalType": "uint256",
    "name": "amount0",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amount1",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "decimals",
"outputs": [
{
    "internalType": "uint8",
    "name": "",
    "type": "uint8"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "factory",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "getReserves",
"outputs": [
{
    "internalType": "uint112",
    "name": "_reserve0",
    "type": "uint112"
},
{
    "internalType": "uint112",
    "name": "_reserve1",
    "type": "uint112"
},
{
    "internalType": "uint32",
    "name": "_blockTimestampLast",
    "type": "uint32"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "_token0",
    "type": "address"
},
{
    "internalType": "address",
    "name": "_token1",
    "type": "address"
}
],
"name": "initialize",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "kLast",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "to",
    "type": "address"
}
],
"name": "mint",
"outputs": [
{
    "internalType": "uint256",
    "name": "liquidity",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "name",
"outputs": [
{
    "internalType": "string",
    "name": "",
    "type": "string"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"name": "nonces",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "owner",
    "type": "address"
},
{
    "internalType": "address",
    "name": "spender",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "deadline",
    "type": "uint256"
},
{
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
},
{
    "internalType": "bytes32",
    "name": "r",
    "type": "bytes32"
},
{
    "internalType": "bytes32",
    "name": "s",
    "type": "bytes32"
}
],
"name": "permit",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "price0CumulativeLast",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "price1CumulativeLast",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "to",
    "type": "address"
}
],
"name": "skim",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "uint256",
    "name": "amount0Out",
    "type": "uint256"
},
{
    "internalType": "uint256",
    "name": "amount1Out",
    "type": "uint256"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "bytes",
    "name": "data",
    "type": "bytes"
}
],
"name": "swap",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "symbol",
"outputs": [
{
    "internalType": "string",
    "name": "",
    "type": "string"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [],
"name": "sync",
"outputs": [],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "token0",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "token1",
"outputs": [
{
    "internalType": "address",
    "name": "",
    "type": "address"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": true,
"inputs": [],
"name": "totalSupply",
"outputs": [
{
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
}
],
"payable": false,
"stateMutability": "view",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "transfer",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
},
{
"constant": false,
"inputs": [
{
    "internalType": "address",
    "name": "from",
    "type": "address"
},
{
    "internalType": "address",
    "name": "to",
    "type": "address"
},
{
    "internalType": "uint256",
    "name": "value",
    "type": "uint256"
}
],
"name": "transferFrom",
"outputs": [
{
    "internalType": "bool",
    "name": "",
    "type": "bool"
}
],
"payable": false,
"stateMutability": "nonpayable",
"type": "function"
}
]
export const quest_creator_abi = [
{
"anonymous": false,
"inputs": [
{
"indexed": false,
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"indexed": false,
"internalType": "address",
"name": "owner",
"type": "address"
}
],
"name": "TokenCreated",
"type": "event"
},
{
"inputs": [
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
},
{
"internalType": "bytes32",
"name": "initCodeHash",
"type": "bytes32"
}
],
"name": "computeAddress",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "name",
"type": "string"
},
{
"internalType": "string",
"name": "symbol",
"type": "string"
},
{
"internalType": "uint256",
"name": "totalSupply",
"type": "uint256"
},
{
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
}
],
"name": "createToken",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "getTokenCount",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"name": "tokens",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
}
]
export const mint_quest_abi = [
{
"inputs": [],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "token",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "owner",
"type": "address"
}
],
"name": "LiquidityAdded",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": false,
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"indexed": false,
"internalType": "address",
"name": "owner",
"type": "address"
}
],
"name": "TokenCreated",
"type": "event"
},
{
"inputs": [],
"name": "ETH_AMOUNT_TO_LIQUIDITY",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "TOKEN_AMOUNT_TO_LIQUIDITY",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "TOTAL_SUPPLY",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
},
{
"internalType": "bytes32",
"name": "initCodeHash",
"type": "bytes32"
}
],
"name": "computeAddress",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "name",
"type": "string"
},
{
"internalType": "string",
"name": "symbol",
"type": "string"
},
{
"internalType": "uint256",
"name": "totalSupply",
"type": "uint256"
},
{
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
}
],
"name": "createToken",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [
{
"internalType": "string",
"name": "name",
"type": "string"
},
{
"internalType": "string",
"name": "symbol",
"type": "string"
},
{
"internalType": "address",
"name": "owner",
"type": "address"
},
{
"internalType": "string",
"name": "kind",
"type": "string"
},
{
"internalType": "string",
"name": "content",
"type": "string"
}
],
"name": "createTokenAndAddLiquidity",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [],
"name": "getTokenCount",
"outputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [
{
"internalType": "uint256",
"name": "",
"type": "uint256"
}
],
"name": "tokens",
"outputs": [
{
"internalType": "address",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
},
{
"inputs": [],
"name": "uniswapV2Router",
"outputs": [
{
"internalType": "contract IUniswapV2Router02",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
}
] 
export const mint_valuelink_abi = [
{
"inputs": [
{
"internalType": "address",
"name": "_router",
"type": "address"
},
{
"internalType": "address",
"name": "_factory",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "tokenA",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "tokenB",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amountA",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amountB",
"type": "uint256"
}
],
"name": "LiquidityAdded",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "tokenA",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "tokenB",
"type": "address"
},
{
"indexed": false,
"internalType": "address",
"name": "pair",
"type": "address"
}
],
"name": "PairCreated",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "token",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "recipient",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amount",
"type": "uint256"
}
],
"name": "RemainderTransferred",
"type": "event"
},
{
"inputs": [
{
"internalType": "address",
"name": "tokenA",
"type": "address"
},
{
"internalType": "address",
"name": "tokenB",
"type": "address"
},
{
"internalType": "uint256",
"name": "ethAmount",
"type": "uint256"
}
],
"name": "createValueLink",
"outputs": [],
"stateMutability": "payable",
"type": "function"
},
{
"stateMutability": "payable",
"type": "receive"
}
]
export const tx_abi = [
{
"inputs": [
{
"internalType": "address",
"name": "_uniswapRouterAddress",
"type": "address"
}
],
"stateMutability": "nonpayable",
"type": "constructor"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "buyer",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amountOut",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "ethSpent",
"type": "uint256"
}
],
"name": "TokensPurchased",
"type": "event"
},
{
"anonymous": false,
"inputs": [
{
"indexed": true,
"internalType": "address",
"name": "seller",
"type": "address"
},
{
"indexed": true,
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"indexed": false,
"internalType": "uint256",
"name": "amountIn",
"type": "uint256"
},
{
"indexed": false,
"internalType": "uint256",
"name": "ethReceived",
"type": "uint256"
}
],
"name": "TokensSold",
"type": "event"
},
{
"inputs": [
{
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"internalType": "uint256",
"name": "amountOutMin",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "deadline",
"type": "uint256"
}
],
"name": "buyTokenWithETH",
"outputs": [],
"stateMutability": "payable",
"type": "function"
},
{
"inputs": [
{
"internalType": "address",
"name": "tokenAddress",
"type": "address"
},
{
"internalType": "uint256",
"name": "amountIn",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "amountOutMin",
"type": "uint256"
},
{
"internalType": "uint256",
"name": "deadline",
"type": "uint256"
}
],
"name": "sellTokenForETH",
"outputs": [],
"stateMutability": "nonpayable",
"type": "function"
},
{
"inputs": [],
"name": "uniswapV2Router",
"outputs": [
{
"internalType": "contract IUniswapV2Router02",
"name": "",
"type": "address"
}
],
"stateMutability": "view",
"type": "function"
}
]

export const QUEST_FACTORY_ADDRESS = '0x34F4E2C5543F87C57f8525Afb4eF45449f95cBd9';
export const UNISWAP_FACTORY_ADDRESS = '0x7BE08E47aea1930Da1C36c7fd210047c3aB6Ca8F';
export const WETH_ADDRESS = '0x766425C9402D4f5E9E6E0572E083944fa9612EBe';
export const UNISWAP_PAIR_ADDRESS = '0x58FF30c172C14915CD2C8672f8E270201fEB6C1b';
export const UNISWAP_ROUTER = '0x02c22a4C061F87f9F7303505a448a9023bD32BE3';
export const MINT_QUEST_ADDRESS = '0x675873845682fDf1E56073a1335bDC0Ee7DB9bA7';
export const QUEST_CREATOR_ADDRESS = '0xc46f52e0b3A300210025487265919A64CDaB7102';
export const MINT_VALUELINK_ADDRESS = '0x9010CB497697D118D13b2d9714d88696935e9A8e'; 
export const TX_ADDRESS = '0x2e0b3098288619a3BF98d5D129BF58f2C6E34573';
export const OLD_MINT_QUEST_ADDRESS = '0x90107E2Cb9777cc2e749f173B66cC749d7abeA69'; //before buy function has 3

//get addresses
export const BLOCK_HEIGHT = 200000;
