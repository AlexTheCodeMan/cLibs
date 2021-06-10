pragma solidity ^0.5.16;

import "../../externalContracts/UniswapV2Contracts.sol";
import "../../utils/Constants.sol";
import "../../utils/math/SafeMath.sol";
import "../ERC20/ERC20Methods.sol";
import "./UniswapV2MethodsErrorReporter.sol";


contract UniswapV2Methods is UniswapV2MethodsErrorReporter, ERC20Methods, UniswapV2Addresses, Constants{
    using SafeMath for uint;

    //access - internal
    //fromTokenAddr: 0x6B175474E89094C44Da98b954EedeAC495271d0F
    //fromTokenAmount: 100000000000000000000
    //toTokenAddr: 0x0D8775F648430679A709E98d2b0Cb6250d2887EF
    //slippageMantissa18: 100000000000000000
    //recipientAddr: 0x0457F40b63aF465a7a31efCD060095679491a248
    function uniswap_swapExactTokensForTokens(address fromTokenAddr, uint fromTokenAmount, address toTokenAddr, uint slippageMantissa18, address recipientAddr) internal returns(UniswapV2MethodsError err, uint toTokenAmount){
          uint swap_amountIn = fromTokenAmount;
          address[] memory swap_path = new address[](2);

          swap_path[0] = fromTokenAddr;
          swap_path[1] = toTokenAddr;

          address swap_to = recipientAddr;
          uint swap_deadline = block.timestamp;

          UniswapV2MethodsError _err;
          (_err, toTokenAmount) = uniswap_swapExactTokensForTokens_raw(swap_amountIn, slippageMantissa18, swap_path, swap_to, swap_deadline);

          if(_err != UniswapV2MethodsError.NO_ERROR){
              emit fail(uint(_err));
              return (UniswapV2MethodsError.SWAP_FAILED, 0);
          }

          return (UniswapV2MethodsError.NO_ERROR, toTokenAmount);
    }

    //access - internal
    //test data
    //ethAmountIn: 100000000000000000000
    //toTokenAddr: 0x6B175474E89094C44Da98b954EedeAC495271d0F
    //slippageMantissa18: 100000000000000000
    //recipientAddr: 0x0457F40b63aF465a7a31efCD060095679491a248
    function uniswap_swapExactETHForTokens(uint ethAmountIn, address toTokenAddr, uint slippageMantissa18, address recipientAddr) internal returns(uint toTokenAmount){

         toTokenAmount = uinswap_swapExactETHForTokens_raw(ethAmountIn, slippageMantissa18, toTokenAddr, recipientAddr, block.timestamp);
         return toTokenAmount;
    }

    function uniswap_swapExactTokensForTokens_raw(uint amountIn, uint slippageMantissa18, address[] memory path, address to, uint deadline) internal returns(UniswapV2MethodsError err, uint amountOut){

        UniswapV2Router02 router = UniswapV2Router02(uniswapV2Router02Address);
        //cal amountOutMin
        uint estAmountOut = router.getAmountsOut(amountIn, path)[1];
        uint dstDecimals = ERC20(path[1]).decimals(); ///
        uint amountOutMin = estAmountOut.mul(oneMantissa.sub(slippageMantissa18).div(10**(18 - dstDecimals))).div(10**dstDecimals);
        //error below

        if(!approve(path[0], uniswapV2Router02Address, amountIn)) {
             emit fail(uint(UniswapV2MethodsError.APPROVE_FAILED));
             return (UniswapV2MethodsError.APPROVE_FAILED, 0);
        }
        //swap
        amountOut = router.swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)[1];

        return (UniswapV2MethodsError.NO_ERROR, amountOut);

    }


    struct uinswap_swapExactETHForTokens_rawVars{
        UniswapV2Router02 router;
        address[] path;
        uint estAmountOut;
        uint dstDecimals;
        uint amountOutMin;
        uint amountOut;
    }

    function uinswap_swapExactETHForTokens_raw(uint amountIn, uint slippageMantissa18, address toTokenAddr, address recipientAddr, uint deadline) internal returns(uint amountOut){
        uinswap_swapExactETHForTokens_rawVars memory v;

        v.router = UniswapV2Router02(uniswapV2Router02Address);

        v.path = new address[](2);
        v.path[0] = wETHAddr;
        v.path[1] = toTokenAddr;

        v.estAmountOut = v.router.getAmountsOut(amountIn, v.path)[1];
        v.dstDecimals = ERC20(toTokenAddr).decimals();
        v.amountOutMin = v.estAmountOut.mul(slippageMantissa18.div(10**(18 - v.dstDecimals))).div(10**v.dstDecimals);

        amountOut = v.router.swapExactETHForTokens.value(amountIn)(v.amountOutMin, v.path, recipientAddr, deadline)[1];

        return amountOut;
    }

    function uniswap_getAmountsOut(uint amountIn, address tokenIn, address tokenOut) internal view returns(uint amountOut){
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        if(tokenIn == address(0)){
            path[0] = wETHAddr;
        }

        if(tokenOut == address(0)){
            path[1] = wETHAddr;
        }

        return UniswapV2Router02(uniswapV2Router02Address).getAmountsOut(amountIn, path)[1];
    }

    //access: interal
    //test data
    //note: needs to be called by another contract
    //fromAddr:     "0x0000000000000000000000000000000000000000" (ETH)                                                                    "0xdAC17F958D2ee523a2206206994597C13D831ec7" (USDT)
    //toAddr:       "0x6B175474E89094C44Da98b954EedeAC495271d0F" (DAI)                            "0x6B175474E89094C44Da98b954EedeAC495271d0F" (DAI)
    //fromAmount:   "1000000000000000000"                                                         "1000000"
    //max_uniswap_slippage: 100000000000000000
    function uniswap_swap(address fromAddr, address toAddr, uint fromAmount, uint max_uniswap_slippage, address receiptAddr) internal returns(UniswapV2MethodsError err, uint amountOut){

        err = UniswapV2MethodsError.NO_ERROR;

        // from is ETH
        if(fromAddr == address(0)){
            amountOut = uniswap_swapExactETHForTokens(fromAmount, toAddr, max_uniswap_slippage, receiptAddr);
            return (UniswapV2MethodsError.NO_ERROR, amountOut);
        }

        // from is Token
        (err, amountOut) = uniswap_swapExactTokensForTokens(fromAddr, fromAmount, toAddr, max_uniswap_slippage, receiptAddr);
        if(err != UniswapV2MethodsError.NO_ERROR){
            emit fail(uint(UniswapV2MethodsError.SWAP_FAILED), uint(err));
            return (UniswapV2MethodsError.SWAP_FAILED, 0);
        }

        return (UniswapV2MethodsError.NO_ERROR, amountOut);
    }
}
