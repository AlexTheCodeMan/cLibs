pragma solidity ^0.5.16;

contract ERC20{

    uint8 public decimals;

    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address owner) external view returns (uint);
    function transfer(address dst, uint amount) external returns (bool);
    function symbol() external view returns (string memory);

}

contract USDT_ERC20{
    function approve(address spender, uint value) external;
}
