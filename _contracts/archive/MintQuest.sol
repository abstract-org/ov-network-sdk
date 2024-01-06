// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import './QuestCreator.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/Context.sol';


contract MintQuest is Context, QuestCreator {
    IUniswapV2Router02 public immutable uniswapV2Router;
    
    uint256 public constant TOKEN_AMOUNT_TO_LIQUIDITY = 10000 * 10 ** 18; 
    uint256 public constant ETH_AMOUNT_TO_LIQUIDITY = 0.05 ether;

    event LiquidityAdded(address indexed token, address indexed owner);

    constructor() {
        uniswapV2Router = IUniswapV2Router02(0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9);
    }

    function createTokenAndAddLiquidity(
        string calldata name,
        string calldata symbol,
        address owner,
        uint256 desiredTokenAmount
    ) 
    public 
    payable 
    returns (address) {

        // Create token with the contract itself as the owner
        address newToken = createToken(name, symbol, address(this));

        // Approve the transfer of TOKEN_AMOUNT_TO_LIQUIDITY tokens from this contract
        IERC20(newToken).approve(address(uniswapV2Router), TOKEN_AMOUNT_TO_LIQUIDITY);

        // Add the tokens to the Uniswap pool
        uniswapV2Router.addLiquidityETH{value: ETH_AMOUNT_TO_LIQUIDITY}(
            newToken,
            TOKEN_AMOUNT_TO_LIQUIDITY,
            0, // minTokens
            0, // minETH
            address(0), // Send liquidity tokens to the holder contract
            block.timestamp + 15 minutes // deadline
        );

        // If ETH was sent for the swap operation, then execute it
        if(msg.value > ETH_AMOUNT_TO_LIQUIDITY) {
            uint256 remainingETHForSwap = msg.value - ETH_AMOUNT_TO_LIQUIDITY;

            // Only swap if desiredTokenAmount is greater than 0
            if(desiredTokenAmount > 0) {
                uint256 amountETHNeeded = uniswapV2Router.getAmountsIn(desiredTokenAmount, getPathForETHToToken(newToken))[0];
                                
                uniswapV2Router.swapETHForExactTokens{value: amountETHNeeded}(
                    desiredTokenAmount, 
                    getPathForETHToToken(newToken),
                    owner,
                    block.timestamp + 15 minutes
                );

                // Refund any remaining ETH
                uint256 amountETHLeft = remainingETHForSwap - amountETHNeeded;
                if(amountETHLeft > 0) {
                    payable(owner).transfer(amountETHLeft);
                }
            } else {
                // If desiredTokenAmount is 0, just refund the remaining ETH to the owner
                payable(owner).transfer(remainingETHForSwap);
            }
        }

        // Emit the LiquidityAdded event
        emit LiquidityAdded(newToken, owner);

        return newToken;
    }

    function getPathForETHToToken(address token) private view returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = token;

        return path;
    }
}