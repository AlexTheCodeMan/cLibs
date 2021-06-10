pragma solidity ^0.5.16;

import "../../utils/Addresses.sol";
import "../../externalContracts/ERC20.sol";
import "./ERC20ErrorReporter.sol";

contract ERC20Methods is ERC20ErrorReporter, ERC20Addresses{

    function getDecimals(address token) internal view returns(uint decimals){
        if(token == address(0)){
            return 18;
        }

        return ERC20(token).decimals();
    }

    function transferIn(address token, address from, address to, uint amount) internal returns(ERC20Error){

        if(!ERC20(token).transferFrom(from, to, amount)){
             emit fail(uint(ERC20Error.TRANSFER_FROM_FAILED));
             return ERC20Error.TRANSFER_FROM_FAILED;
        }

        return ERC20Error.NO_ERROR;
    }

    function transferOut(address token, address to, uint amount) internal returns(ERC20Error){
        ERC20 erc20 = ERC20(token);

        if(!erc20.approve(to, amount)){
             emit fail(uint(ERC20Error.APPROVE_FAILED));
             return ERC20Error.APPROVE_FAILED;
        }

        if(!erc20.transfer(to, amount)){
             emit fail(uint(ERC20Error.TRANSFER_FAILED));
             return ERC20Error.TRANSFER_FAILED;
        }

        return ERC20Error.NO_ERROR;
    }

    //works with ETH and ERC20
    function balanceOf(address tokenAddr, address accAddr) internal view returns(uint){
        //for ETH
        if(tokenAddr == address(0)){
            return accAddr.balance;
        }

        return ERC20(tokenAddr).balanceOf(accAddr);
    }

    //works with standard and non-standard ERC20
    function approve(address tokenAddr, address spender, uint256 amount) internal returns(bool){
        if(tokenAddr == usdtAddr){
             USDT_ERC20(usdtAddr).approve(spender, 0);
             USDT_ERC20(usdtAddr).approve(spender, amount);
             return true;
        }

        return ERC20(tokenAddr).approve(spender, amount);
    }
}
