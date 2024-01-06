 ██████╗ ██████╗ ███████╗███╗   ██╗██╗   ██╗ █████╗ ██╗     ██╗   ██╗███████╗
██╔═══██╗██╔══██╗██╔════╝████╗  ██║██║   ██║██╔══██╗██║     ██║   ██║██╔════╝
██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║   ██║███████║██║     ██║   ██║█████╗  
██║   ██║██╔═══╝ ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██╔══██║██║     ██║   ██║██╔══╝  
╚██████╔╝██║     ███████╗██║ ╚████║ ╚████╔╝ ██║  ██║███████╗╚██████╔╝███████╗
 ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝





## Introduction
This repository is an open-source project aimed at building a decentralized exchange with Automated Market Maker (AMM) and unique token/pool creation capabilities. It is setup to run on Ethereum and is configured on Mainnet, Sepolia Testnet, Goerli Testnet (deprecated), and a private GETH NODE. 

## Features
- **Automated Market Maker (AMM):** Utilizing the existing Uniswap V2 router contract 
- **Token/Pool Creation:** Tools and utilities to create unique tokens and liquidity pools.
- **Decentralized Exchange Components:** Core components to help developers build their own DEX platforms.

## Core Functionalities
- Create unique tokens [ERC-20] via CREATE2 (ovTokenBase contract & ./blockchain_posts/mintQuest.js) with unique string name/symbol, automatically in a liquditiy pool with ETH, ready to be swapped or included in other liquidity pools.
- Create liquidity pools (ovPoolBase contract & ./blockchain_posts/mintVL.js) between unique tokens.
- Swapping (ovSwapBase contract & ./blockchain_posts/buyToken.js & ./blockchain_posts/sellToken.js).
- Removing liquidity / redeeming liqudity provider tokens [ERC-20] (./blockchain_posts/removeLiquidity.js).
- Initialize decentralized GraphQL subgraph (https://github.com/posheadig/names/tree/main) to query Token Address and Pool Address by Token Name, in a decentralized manner.
- Create IPFS query and sqlite file retrieval (https://github.com/posheadig/ipfs-sqlite-blockchain), not currently used in ov SDK live version.
- QUERY direct blockchain data via metamask or any provider for token balances, owners, pool reserves, historical tx, events, and many other queries. *** Queries can be found (and traced because of needed cleanup not done yet) throughout ./endpoints.js file ***

## Getting Started
To get started with the OV Network SDK, you will need to clone the repository and install its dependencies. Ensure you have Node.js and npm installed. The included ./Index.html should be enough to get started to get it working with some known token/pair addresses.








CURRENTLY USED CONTRACT INFORMATION IN DEPLOYED ENVIRONMENT:

 MAINNET CONTRACT ADDRESSES
 --------------------------
 ovTOKEN: 0x3BA98B3766b661D1dd1f912A75E2aAc92FFc84eF
 ovPOOL: 0x5587a86C580E04D6157c84FD85758AccbA0b7934
 ovSWAP: 0x7f7429e3cc6FB90238c86B9546c26c59F1baf868

 TESTNET [sepolia] CONTRACT ADDRESSES
 ------------------------------------
 ovTOKEN: 0xec81C83fE9c78B1FDB6F76BB3bB260E6DBE6C66B
 ovPOOL: 0xb3a438972136aca2f4c910d4238ef7e2eec37880
 ovSWAP: 0x5A6e4F0059d8B586FDe7C3e9F63F368F91fDc774
 uniROUTER: 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008
 WETH: 0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9
