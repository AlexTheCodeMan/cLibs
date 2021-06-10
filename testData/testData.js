require('dotenv').config();

const KnownAddresses = require(`${process.env.libPath}/knownAddresses.js`);

function test_uniswap_getAmountsOut(){
    const amountIn = "1000000000000000000";
    const tokenIn = KnownAddresses.findAddress("DAI");
    const tokenOut =  KnownAddresses.zeroAddress;

    const testData1 = [amountIn, tokenIn, tokenOut];

    return [testData1];
}

async function test_cmp_getBorrowedTokenList(){
    const acc_1 = "0xC9877ce47D5B8545A9DF5beC532e55A105064700";
    const acc_2 = "0x3c862e37bb98eec19317c68fde0f59f33552cbda";

    const testData_1 = [acc_1];

    const testData_2 = [acc_2];


    return [testData_1, testData_2];
}

async function test_cmp_getPercentageOfStakeOnBorrowMantissa(){
    const acc = "0xC9877ce47D5B8545A9DF5beC532e55A105064700";
    const cTokenAddr_1 = KnownAddresses.findAddress("cDAI");
    const cTokenAddr_2 = KnownAddresses.findAddress("cETH");

    const testData_1 = [acc, cTokenAddr_1];
    const testData_2 = [acc, cTokenAddr_2];

    return [testData_1, testData_2];
}

async function test_cmp_getPercentageOfStakeOnSupplyMantissa(){
    const acc = "0xC9877ce47D5B8545A9DF5beC532e55A105064700";
    const cTokenAddr_1 = KnownAddresses.findAddress("cDAI");
    const cTokenAddr_2 = KnownAddresses.findAddress("cUSDT");

    const testData_1 = [acc, cTokenAddr_1];
    const testData_2 = [acc, cTokenAddr_2];

    return [testData_1, testData_2];
}

async function test_cmp_getCompDistAmount(){
    const allCurrentMarkets = [
                                'cBAT',  'cDAI',
                                'cETH',  'cUSDC',
                                'cUSDT', 'cWBTC',
                                'cZRX',  'cUNI',
                                'cCOMP'
                              ]
    const testDataSet = [];
    //const acc = "0xC9877ce47D5B8545A9DF5beC532e55A105064700";
    const numberOfBlocks = "441504000";

    for(var i = 0; i < allCurrentMarkets.length; i++){
        testDataSet.push([KnownAddresses.findAddress(allCurrentMarkets[i]), numberOfBlocks]);
    }

    return testDataSet;
}

async function test_cmp_getTotalSupplyInUSD(){
    const allCurrentMarkets = [
                                'cBAT',  'cDAI',
                                'cETH',  'cUSDC',
                                'cUSDT', 'cWBTC',
                                'cZRX',  'cUNI',
                                'cCOMP'
                              ]
    const testDataSet = [];

    for(var i = 0; i < allCurrentMarkets.length; i++){
        testDataSet.push([KnownAddresses.findAddress(allCurrentMarkets[i])]);
    }

    return testDataSet;
}

async function test_cmp_getCompDistSpeedPerBlock(){
    const allCurrentMarkets = [
                                'cBAT',  'cDAI',
                                'cETH',  'cUSDC',
                                'cUSDT', 'cWBTC',
                                'cZRX',  'cUNI',
                                'cCOMP'
                              ]
    const testDataSet = [];

    for(var i = 0; i < allCurrentMarkets.length; i++){
        testDataSet.push([KnownAddresses.findAddress(allCurrentMarkets[i])]);
    }

    return testDataSet;
}

function test_cmp_redeem_underlying(){
    return  [
                "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5", //cETH
                "100000000"
            ]
}

function test_cmp_underlyingValueInUSD(){
    return  [
                "100000000",
                "0xccF4429DB6322D5C611ee964527D42E5d685DD6a"
            ]
}

function test_cmp_getUnderlyingPriceInUSD(){
    return  [
                "0xccF4429DB6322D5C611ee964527D42E5d685DD6a"
            ]
}

function project(){
    return {
              projectPATH: '/Users/main/Documents/macDocumentBackup062020/coding/gitProjects/CompoundLiquidator',
              contractsMap: {
                              CompoundLiquidator: {
                                                    address: '0x35D016f916af917DEA24df551c842937a4f8b70c'
                                                  }
                            }
           }
}

module.exports = {
     test_cmp_redeem_underlying,
     test_cmp_underlyingValueInUSD,
     test_uniswap_getAmountsOut,
     test_cmp_getCompDistSpeedPerBlock,
     test_cmp_getTotalSupplyInUSD,
     test_cmp_getCompDistAmount,
     test_cmp_getPercentageOfStakeOnSupplyMantissa,
     test_cmp_getPercentageOfStakeOnBorrowMantissa,
     test_cmp_getBorrowedTokenList,
     test_cmp_getUnderlyingPriceInUSD,
     project
}
