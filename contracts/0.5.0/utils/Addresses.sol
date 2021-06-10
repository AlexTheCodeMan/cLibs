pragma solidity ^0.5.16;


contract CompoundAddresses{
      address internal constant cDAIAddr = 0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643;
      address internal constant cETHAddr = 0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5;
      address internal constant cUSDCAddr = 0x39AA39c021dfbaE8faC545936693aC917d5E7563;
      address internal constant cUSDTAddr = 0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9;
      address internal constant cWBTCAddr = 0xC11b1268C1A384e55C48c2391d8d480264A3A7F4;
      address internal constant cWBTC2Addr = 0xccF4429DB6322D5C611ee964527D42E5d685DD6a; //migrated at block number 12069867
      address internal constant cCOMPAddr = 0x70e36f6BF80a52b3B46b3aF8e106CC0ed743E8e4;
      address internal constant cSAIAddr = 0xF5DCe57282A584D2746FaF1593d3121Fcac444dC;
      address internal constant compAddr = 0xc00e94Cb662C3520282E6f5717214004A7f26888;

      address internal constant compoundLensAddr = 0xd513d22422a3062Bd342Ae374b4b9c20E0a9a074;
      address internal constant comptrollerAddr = 0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B;
      address internal constant uniswapAnchoredViewAddr = 0x922018674c12a7F0D394ebEEf9B58F186CdE13c1;

      function getCWBTCAddr(uint blockNumber) public pure returns(address){
          if(blockNumber >= 12069867){
              return cWBTC2Addr;
          }

          return cWBTCAddr;
      }
}

contract ERC20Addresses{
      address internal constant usdtAddr = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
}

contract UniswapV2Addresses{
      address internal constant uniswapV2Router02Address = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
      address internal constant wETHAddr = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
}
