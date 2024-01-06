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
"inputs": [],
"name": "INIT_CODE_HASH",
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
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "desiredTokenAmount",
                "type": "uint256"
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "desiredTokenAmount",
                "type": "uint256"
            }
        ],
        "name": "getEstimatedETH",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
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
/*
export const mint_valuelink_abi = [
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
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]*/
export const mint_valuelink_abi = [
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
                "name": "minAmountTokenA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minAmountTokenB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "addOwnedTokensAsLiquidity",
        "outputs": [],
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
                "name": "minAmountTokenA",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "minAmountTokenB",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            }
        ],
        "name": "buyTokensAsLiquidity",
        "outputs": [],
        "stateMutability": "payable",
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
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]
export const tx_abi = [
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
        "name": "buyExactTokenWithETH",
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
        "name": "sellExactTokenForETH",
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
export const UNISWAP_FACTORY_ADDRESS = '0x7E0987E5b3a30e3f2828572Bb659A548460a3003';
export const WETH_ADDRESS = '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9';
export const UNISWAP_PAIR_ADDRESS = '0x486941CfA4e4E38e4337f1341700E1941cfF5005';
export const UNISWAP_ROUTER = '0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008';
export const MINT_QUEST_ADDRESS = '0xec81C83fE9c78B1FDB6F76BB3bB260E6DBE6C66B';
export const OLD_MINT_QUEST_ADDRESS = '0xea667642aE384fFe647a6163e79d20F468B538dc';
export const QUEST_CREATOR_ADDRESS = '0xF602D5c6BAc362Ce383FB5E2093f24e5dAA0424e';
export const MINT_VALUELINK_ADDRESS_OLD = '0xAd3A38D01299c8A357401aAeEBd5EfD74E8D2042'; 
export const MINT_VALUELINK_ADDRESS = '0xb3a438972136aca2f4c910d4238ef7e2eec37880'; ///0xf6969888019C4701A6F59f866f5141af058fab54 old one
export const TX_ADDRESS = '0x5A6e4F0059d8B586FDe7C3e9F63F368F91fDc774'; //0xd09CF468D5AAe5C5Ff228A8Ee7F65f682ae1bd0a old one
export const OLDEST_MINT_QUEST_ADDRESS = '0x2e63a84b27371D68A911569BA3667Dc823def5B5';

//get data
export const BLOCK_HEIGHT = 4000000;
