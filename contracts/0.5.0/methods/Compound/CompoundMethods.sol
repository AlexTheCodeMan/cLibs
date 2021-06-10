pragma solidity ^0.5.16;

import "../../utils/math/SafeMath.sol";
import "../../utils/StringUtil.sol";
import "../../utils/Constants.sol";
import "../../utils/Addresses.sol";
import "../../externalContracts/CompoundContracts.sol";
import "../../methods/Compound/CompoundMethods.sol";
import "../ERC20/ERC20Methods.sol";
import "./CompoundMethodsErrorReporter.sol";



contract CompoundMethods is CompoundMethodsErrorReporter, ERC20Methods, CompoundAddresses, UniswapV2Addresses, Constants, StringUtil{
      using SafeMath for uint;

      function cmp_redeemUnderlying(address cToken, uint amount) internal returns(CompoundMethodsError err){
          uint error_redeem = CToken(cToken).redeem(amount);
          if(error_redeem != 0){
              emit fail(uint(CompoundMethodsError.Redeem_Failed), error_redeem);
              return CompoundMethodsError.Redeem_Failed;
          }

          return CompoundMethodsError.NO_ERROR;
      }

      function cmp_liquidateBorrow(address cTokenBorrowed, address underlyingBorrowed, address borrower, uint repayAmount, CToken cTokenCollateral) internal returns(CompoundMethodsError err){
          //approve USDT won't work
          if(!approve(underlyingBorrowed, cTokenBorrowed, repayAmount)){
              emit fail(uint(CompoundMethodsError.APPROVE_FAILED));
              return CompoundMethodsError.APPROVE_FAILED;
          }

          //liquidate
          uint err_liquidateBorrow = CErc20(cTokenBorrowed).liquidateBorrow(borrower, repayAmount, cTokenCollateral);
          if(err_liquidateBorrow != 0){
              emit fail(uint(CompoundMethodsError.APPROVE_FAILED), err_liquidateBorrow);
              return CompoundMethodsError.APPROVE_FAILED;
          }

          return CompoundMethodsError.NO_ERROR;
      }

      function cmp_getUnderlyingAddr(address cTokenAddr) internal view returns(address underlyingAddr) {
          if(cTokenAddr == cETHAddr){
              return address(0);
          }

          underlyingAddr = CToken(cTokenAddr).underlying();

          return underlyingAddr;
      }


      function cmp_underlyingValueInUSD(uint underlyingBalance, address cTokenAddr) internal view returns(uint valueInUSD){

          uint underlyingDecimals = cmp_getUnderlyingDecimals(cTokenAddr);
          valueInUSD = cmp_getUnderlyingPriceInUSD(cTokenAddr).mul(underlyingBalance).div(10**underlyingDecimals);

          return valueInUSD;
      }

      function cmp_getUnderlyingPriceInUSD(address cTokenAddr) internal view returns (uint priceInUSD){

            address oracleAddr = Comptroller(comptrollerAddr).oracle();

            if(cTokenAddr == cUSDCAddr || cTokenAddr == cUSDTAddr){
                priceInUSD = oneMantissa;
                return priceInUSD;
            }

            if(cTokenAddr == cWBTC2Addr || cTokenAddr == cWBTCAddr){
                priceInUSD = PriceOracle(oracleAddr).getUnderlyingPrice(CToken(cTokenAddr)).div(10**10);
                return priceInUSD;
            }

            priceInUSD = PriceOracle(oracleAddr).getUnderlyingPrice(CToken(cTokenAddr));
            return priceInUSD;
      }

      function cmp_getPriceInUSDByUnderlyingAddr(address underlyingAddr) internal view returns(uint underlyingPriceInUSD){
          string memory symbol = ERC20(underlyingAddr).symbol();
          if(compareStrings(symbol, "wBTC")){
              symbol = "BTC";
          }

          return cmp_getPriceBySymbol(symbol).mul(10**12);
      }

      function cmp_getPriceBySymbol(string memory symbol) internal view returns(uint priceInUSDMantissa6){
          return UniswapAnchoredView(uniswapAnchoredViewAddr).price(symbol);
      }

      function cmp_getUnderlyingSymbol(address cTokenAddr) internal view returns(string memory getUnderlyingSymbol){
          if(cTokenAddr == cETHAddr) return "ETH";

          if(cTokenAddr == cSAIAddr) return "SAI";

          return ERC20(CToken(cTokenAddr).underlying()).symbol();
      }

      function cmp_getUnderlyingDecimals(address cTokenAddr) internal view returns(uint decimals){
          if(cTokenAddr == cETHAddr){
               decimals = 18;
               return decimals;
          }

          address underlyingAddr = cmp_getUnderlyingAddr(cTokenAddr);
          decimals = ERC20(underlyingAddr).decimals();
          return decimals;
      }

      //not tested
      function cmp_getTotalSupplyInUSD(address cTokenAddr) internal view returns(uint totalSupplyInUSD){
          return cmp_underlyingValueInUSD(cmp_getTotalSupply(cTokenAddr), cTokenAddr);
      }

      function cmp_getTotalSupply(address cTokenAddr) internal view returns(uint totalSupply){
          CToken cToken = CToken(cTokenAddr);
          uint cash = cToken.getCash();
          uint totalBorrow = cToken.totalBorrows();
          uint totalReserves = cToken.totalReserves();

          return cash.add(totalBorrow).sub(totalReserves);
      }

      function cmp_getCompDistSpeedPerBlock(address cTokenAddr) internal view returns(uint compDistSpeedPerBlock){
          Comptroller comptroller = Comptroller(comptrollerAddr);
          return comptroller.compSpeeds(cTokenAddr);
      }


      function cmp_getCompDistAmount(address cTokenAddr, uint numberOfBlocks) internal view returns(uint compDistAmount){
          return cmp_getCompDistSpeedPerBlock(cTokenAddr).mul(numberOfBlocks);
      }

      function cmp_getCurrentCTokenAddrList() internal view returns(address[] memory cTokenAddrList){
            Comptroller comptroller = Comptroller(comptrollerAddr);
            CToken[] memory allMarkets = comptroller.getAllMarkets();

            cTokenAddrList = new address[](cmp_getNumberOfCurrentCTokens(allMarkets));

            CToken eachCToken;
            uint index;
            for(uint i = 0; i < allMarkets.length; i++){
                eachCToken = allMarkets[i];

                if(!cmp_isCurrentCToken(address(eachCToken))) continue;

                cTokenAddrList[index] = address(eachCToken);
                index++;
            }

            return cTokenAddrList;
      }

      function cmp_getCurrentCTokenSymbolList() internal view returns(string[] memory cTokenSymbolList){
            Comptroller comptroller = Comptroller(comptrollerAddr);
            CToken[] memory allMarkets = comptroller.getAllMarkets();

            cTokenSymbolList = new string[](cmp_getNumberOfCurrentCTokens(allMarkets));

            CToken eachCToken;
            uint index;
            for(uint i = 0; i < allMarkets.length; i++){
                eachCToken = allMarkets[i];

                if(!cmp_isCurrentCToken(address(eachCToken))) continue;

                cTokenSymbolList[index] = eachCToken.symbol();
                index++;
            }

            return cTokenSymbolList;
      }



      function cmp_isCurrentCToken(address cTokenAddr) internal view returns(bool){
          bool isListed;
          bool isComped;

          Comptroller comptroller = Comptroller(comptrollerAddr);
          (isListed, , isComped) = comptroller.markets(cTokenAddr);

          if(isListed && isComped) return true;

          return false;
      }

      function cmp_getNumberOfCurrentCTokens(CToken[] memory allMarkets) internal view returns(uint numberOfCurrentCTokens){

          for(uint i = 0; i < allMarkets.length; i++){
              if(cmp_isCurrentCToken(address(allMarkets[i]))) numberOfCurrentCTokens++;
          }

          return numberOfCurrentCTokens;
      }

      function cmp_getPercentageOfStakeOnSupplyMantissa(address acc, address cTokenAddr) internal view returns(uint percentageOfStakeOnSupplyMantissa){

          uint supplyByTheAcc = cmp_getUnderlyingBalanceOfAnAcc(acc, cTokenAddr);

          return cmp_calPercentageOfStakeOnSupplyMantissa(cTokenAddr, supplyByTheAcc);
      }

      function cmp_calPercentageOfStakeOnSupplyMantissa(address cTokenAddr, uint supplyByTheAcc) internal view returns(uint percentageOfStakeOnSupplyMantissa){
          uint totalSupply = cmp_getTotalSupply(cTokenAddr);

          return supplyByTheAcc.mul(oneMantissa).div(totalSupply);
      }

      function cmp_getPercentageOfStakeOnBorrowMantissa(address acc, address cTokenAddr) internal view returns(uint percentageOfStakeOnBorrowMantissa){

          uint err;
          uint borrowByTheAcc;

          (err, ,borrowByTheAcc, ) = CToken(cTokenAddr).getAccountSnapshot(acc);

          if(err != 0){
              return 0;
          }

          return cmp_calPercentageOfStakeOnBorrowMantissa(cTokenAddr, borrowByTheAcc);
      }

      function cmp_calPercentageOfStakeOnBorrowMantissa(address cTokenAddr, uint borrowByTheAcc) internal view returns(uint percentageOfStakeOnBorrowMantissa){

          uint totalBorrow = CToken(cTokenAddr).totalBorrows();

          return borrowByTheAcc.mul(oneMantissa).div(totalBorrow);
      }

      function cmp_getUnderlyingBalanceOfAnAcc(address acc, address cTokenAddr) internal view returns(uint underlyingBalanceOfAnAcc){
          CToken cToken = CToken(cTokenAddr);
          return cToken.balanceOf(acc).mul(cToken.exchangeRateStored()).div(oneMantissa);
      }

      function cmp_getBorrowedTokenList(address acc) internal view returns(address[] memory borrowedCTokenList){
          CToken[] memory allMarkets = Comptroller(comptrollerAddr).getAllMarkets();

          uint length;
          for(uint i = 0; i < allMarkets.length; i++){
//require(false, uint2str(CToken(cDAIAddr).borrowBalanceStored(acc)));
              if(allMarkets[i].borrowBalanceStored(acc) == 0) continue;

              length++;
          }

          borrowedCTokenList = new address[](length);

          uint index;
          for(uint i = 0; i < allMarkets.length; i++){
              if(allMarkets[i].borrowBalanceStored(acc) == 0) continue;

              borrowedCTokenList[index] = address(allMarkets[i]);
              index++;
          }

          return borrowedCTokenList;
      }

      function cmp_getCollateralFactorMantissa(address cTokenAddr) internal view returns(uint collateralFactorMantissa){
          bool isListed;

          (isListed, collateralFactorMantissa, ) = Comptroller(comptrollerAddr).markets(cTokenAddr);

          if(!isListed) return 0;

          return collateralFactorMantissa;
      }



}
