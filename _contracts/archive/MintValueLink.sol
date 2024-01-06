pragma solidity ^0.8.6;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract CreateValueLink {
    IUniswapV2Router02 public immutable uniswapV2Router;

    // Define the events
    event PairCreated(address indexed tokenA, address indexed tokenB, address pair);
    event LiquidityAdded(address indexed tokenA, address indexed tokenB, uint amountA, uint amountB);
    event RemainderTransferred(address indexed token, address indexed recipient, uint amount);
    
    constructor() {
        uniswapV2Router = IUniswapV2Router02(0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9); // hardcoded address
    }

    function createValueLink(address tokenA, address tokenB, uint256 ethAmount) public payable {
        require(msg.value >= ethAmount, "Not enough ETH sent");

        // Create the pair
        IUniswapV2Factory factory = IUniswapV2Factory(uniswapV2Router.factory());
        address pair = factory.getPair(tokenA, tokenB);
        if (pair == address(0)) {
            // Pair does not exist
            pair = factory.createPair(tokenA, tokenB);
            emit PairCreated(tokenA, tokenB, pair);
        }

        // Calculate ETH amounts
        uint256 halfEthAmount = ethAmount / 2;

        // Buy tokens
        uint256 boughtTokenAAmount = swapExactETHForTokens(tokenA, halfEthAmount);
        uint256 boughtTokenBAmount = swapExactETHForTokens(tokenB, halfEthAmount);

        // Add liquidity
        addLiquidity(tokenA, tokenB, boughtTokenAAmount, boughtTokenBAmount);

        // Transfer any remaining tokens to sender
        transferRemainder(tokenA);
        transferRemainder(tokenB);
    }

    function swapExactETHForTokens(address token, uint256 ethAmount) internal returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = uniswapV2Router.WETH();
        path[1] = token;

        // Make the swap
        uint[] memory amounts = uniswapV2Router.swapExactETHForTokens{ value: ethAmount }(
            0, 
            path, 
            address(this), 
            block.timestamp
        );

        return amounts[1];
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) internal {
        IERC20(tokenA).approve(address(uniswapV2Router), amountA);
        IERC20(tokenB).approve(address(uniswapV2Router), amountB);

        uniswapV2Router.addLiquidity(
            tokenA,
            tokenB,
            amountA,
            amountB,
            0,
            0,
            msg.sender,
            block.timestamp
        );
        // Emit the LiquidityAdded event
        emit LiquidityAdded(tokenA, tokenB, amountA, amountB);
    }

    function transferRemainder(address token) internal {
        uint256 remainder = IERC20(token).balanceOf(address(this));
        if (remainder > 0) {
            IERC20(token).transfer(msg.sender, remainder);
            emit RemainderTransferred(token, msg.sender, remainder);
        }
    }

    receive() external payable {}
}
