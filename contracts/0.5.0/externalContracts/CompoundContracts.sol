pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./ERC20.sol";

contract Comptroller{
    struct Market {
           bool isListed;
           uint collateralFactorMantissa;
           bool isComped;
    }

    mapping(address => Market) public markets;
    mapping(address => uint) public compAccrued;


    uint public closeFactorMantissa;
    uint public liquidationIncentiveMantissa;
    address public oracle;
    function getAccountLiquidity(address account) public view returns (uint, uint, uint);
    function getAssetsIn(address account) external view returns (address[] memory);
    function compSpeeds(address cTokenAddress) external view returns(uint);
    function getAllMarkets() public view returns (CToken[] memory);


}

contract CToken is ERC20{
    address public underlying;
    uint public totalBorrows;
    uint public totalReserves;
    
    function mint(uint mintAmount) external returns (uint);
    function redeem(uint redeemTokens) external returns (uint);
    function exchangeRateStored() public view returns (uint);
    function balanceOfUnderlying(address owner) external returns (uint);
    function borrowBalanceStored(address account) public view returns (uint);
    function getCash() external view returns (uint);
    function totalBorrowsCurrent() external view returns (uint);
    function borrowRatePerBlock() external view returns (uint);
    function supplyRatePerBlock() external view returns (uint);
    function getAccountSnapshot(address account) external view returns (uint, uint, uint, uint);
}

contract PriceOracle{
    function getUnderlyingPrice(CToken cToken) public view returns (uint);
}

contract UniswapAnchoredView{
    function price(string memory symbol) public view returns (uint);
}

contract CErc20 is CToken{
    address public underlying;
    function liquidateBorrow(address borrower, uint repayAmount, CToken cTokenCollateral) external returns (uint);
}

contract CompoundLens{

    struct CompBalanceMetadataExt{
            uint balance;
            uint votes;
            address delegate;
            uint allocated;
    }

    function getCompBalanceMetadataExt(Comp comp, ComptrollerLensInterface comptroller, address account) external returns (CompBalanceMetadataExt memory);

}

contract Comp{

}

interface ComptrollerLensInterface {

}
