pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./0.5.0/methods/Compound/CompoundMethods.sol";
import "./0.5.0/methods/Uniswap/UniswapV2Methods.sol";


contract Test is CompoundMethods, UniswapV2Methods{
    function test_cmp_redeemUnderlying(address cToken, uint amount) public returns(CompoundMethodsError err){
        return cmp_redeemUnderlying(cToken, amount);
    }

    function test_cmp_underlyingValueInUSD(uint underlyingBalance, address cTokenAddr) public view returns(uint valueInUSD){
        return cmp_underlyingValueInUSD(underlyingBalance, cTokenAddr);
    }

    function test_uniswap_getAmountsOut(uint amountIn, address tokenIn, address tokenOut) public view returns(uint amountOut){
        return uniswap_getAmountsOut(amountIn, tokenIn, tokenOut);
    }

    function test_cmp_getCompDistSpeedPerBlock(address cTokenAddr) public view returns(uint compDistSpeedPerBlock){
        return cmp_getCompDistSpeedPerBlock(cTokenAddr);
    }

    function test_cmp_getCurrentCTokenAddrList() public view returns(address[] memory cTokenNameList){
        return cmp_getCurrentCTokenAddrList();
    }

    function test_cmp_getTotalSupplyInUSD(address cTokenAddr) public view returns(uint totalSupplyInUSD){
        return cmp_getTotalSupplyInUSD(cTokenAddr);
    }

    function test_cmp_getCompDistAmount(address cTokenAddr, uint numberOfBlocks) public view returns(uint compDistAmount){
        return cmp_getCompDistAmount(cTokenAddr, numberOfBlocks);
    }

    function test_cmp_getPercentageOfStakeOnSupplyMantissa(address acc, address cTokenAddr) public view returns(uint percentageOfStakeOnSupplyMantissa){
        return cmp_getPercentageOfStakeOnSupplyMantissa(acc, cTokenAddr);
    }

    function test_cmp_getPercentageOfStakeOnBorrowMantissa(address acc, address cTokenAddr) public view returns(uint percentageOfStakeOnBorrowMantissa){
        return cmp_getPercentageOfStakeOnBorrowMantissa(acc, cTokenAddr);
    }

    function test_cmp_getBorrowedTokenList(address acc) public view returns(address[] memory borrowedTokenList){
        return cmp_getBorrowedTokenList(acc);
    }

    function test_cmp_getUnderlyingPriceInUSD(address cTokenAddr) public view returns (uint priceInUSD){
        return cmp_getUnderlyingPriceInUSD(cTokenAddr);
    }

    //for redeem cETH
    function () payable external {

    }
}
