//NOTE: this file has to be placed at the root of the truffle project folder
//IMPORTANT: Don't use relative URLs
require('dotenv').config();
const fs = require('fs');
const Web3 = require("web3");
const TestData = require("./testData/testData.js");

const projectPATH = __dirname;

const ContractsUtils = require(`${process.env.libPath}/contractsUtils.js`);
const CompoundMethods = require(`${process.env.libPath}/CompoundMethods.js`);
const DevNodeEnvSetup = require(`${process.env.libPath}/devNodeEnvSetup.js`);

const Utils = require(`${process.env.libPath}/Utils.js`);
const knownAddresses = require(`${process.env.libPath}/knownAddresses.js`);

const fromAddress = process.env.fromAddress;
const fromPvk = process.env.fromPvk;
const knownTokenAddresses = knownAddresses.knownTokenAddresses;


var web3;
var blockNumber;

const project_1_name = "cLibs";

var project_1;

var contract_Test;

//testing function
const currentTestingFunctionName = "test_cmp_underlyingValueInUSD";

async function automated_testing_entry(_projects, _blockNumber){
    web3 = await ContractsUtils.initWeb3();

    project_1 = _projects[project_1_name];

    blockNumber = _blockNumber;

    Utils.consoleSpace();
    console.log("project_1", project_1);
    await preTestingProcess();
    Utils.consoleSpace();

    //methods being tested go here
    //await test_cmp_redeem_underlying();
    await this[currentTestingFunctionName]();

}

async function test_cmp_getBorrowedTokenList(){
    const testDataSet = await TestData.test_cmp_getBorrowedTokenList();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getBorrowedTokenList", testData);
        console.log("r", r);
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_cmp_getPercentageOfStakeOnBorrowMantissa(){
    const testDataSet = await TestData.test_cmp_getPercentageOfStakeOnBorrowMantissa();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getPercentageOfStakeOnBorrowMantissa", testData);
        console.log("r", r);
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_cmp_getPercentageOfStakeOnSupplyMantissa(){
    const testDataSet = await TestData.test_cmp_getPercentageOfStakeOnSupplyMantissa();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getPercentageOfStakeOnSupplyMantissa", testData);
        console.log("r", r)
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_cmp_getCompDistAmount(){
    const testDataSet = await TestData.test_cmp_getCompDistAmount();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getCompDistAmount", testData);
        console.log("r", r)
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }

}

async function test_cmp_getTotalSupplyInUSD(){
    const testDataSet = await TestData.test_cmp_getTotalSupplyInUSD();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getTotalSupplyInUSD", testData);
        console.log("r", r)
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_cmp_getCurrentCTokenNameList(){
    const r = await ContractsUtils.call(contract_Test, "test_cmp_getCurrentCTokenNameList", []);
    console.log("r", r);

    Utils.consoleSpace();
}

async function test_cmp_getCompDistSpeedPerBlock(){
    const testDataSet = await TestData.test_cmp_getCompDistSpeedPerBlock();
    console.log("testDataSet", testDataSet);

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_cmp_getCompDistSpeedPerBlock", testData);
        console.log("r", r)
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_uniswap_getAmountsOut(){
    const testDataSet = await TestData.test_uniswap_getAmountsOut();

    for(var i = 0; i < testDataSet.length; i++){
        const testData = testDataSet[i];
        console.log("Test data", testData);
        const r = await ContractsUtils.call(contract_Test, "test_uniswap_getAmountsOut", testData);
        console.log("r", r)
        //console.log("actual repayAmount  ", r);
        //console.log("expected repayAmount", testDataAndResult.expected_repayAmounts[i]);

        Utils.consoleSpace();
    }
}

async function test_cmp_redeem_underlying(){

    await DevNodeEnvSetup.sendTestCoins_custom(Utils.getContractAddress(project_1, "Test"), "cETH", "100000000");
    const data = TestData.test_cmp_redeem_underlying();

    const tx = await ContractsUtils.send(contract_Test, "test_cmp_redeemUnderlying", data, "0", fromAddress, fromPvk);
    console.log("test_cmp_redeem_underlying tx", tx);
}

async function test_cmp_underlyingValueInUSD(){
    const data = TestData.test_cmp_underlyingValueInUSD();
    const result = await ContractsUtils.call(contract_Test, "test_cmp_underlyingValueInUSD", data);

    console.log("test_cmp_underlyingValueInUSD result", result);
}

async function test_cmp_getUnderlyingPriceInUSD(){
    const data = TestData.test_cmp_getUnderlyingPriceInUSD();
    const result = await ContractsUtils.call(contract_Test, "test_cmp_getUnderlyingPriceInUSD", data);

    console.log("test_cmp_getUnderlyingPriceInUSD result", result);
}


async function loadAllContracts(){
     contract_Test = await ContractsUtils.loadLocalContractByProject("Test", project_1);
     //contract_CompoundUnderWaterAccounts = await ContractsUtils.loadLocalContractByProject(web3, "CompoundUnderWaterAccounts", project_2);
}

async function preTestingProcess(){
    await loadAllContracts();
}

module.exports = {
     automated_testing_entry,
     test_uniswap_getAmountsOut,
     test_cmp_getCompDistSpeedPerBlock,
     test_cmp_getCurrentCTokenNameList,
     test_cmp_getCompDistAmount,
     test_cmp_getPercentageOfStakeOnSupplyMantissa,
     test_cmp_getPercentageOfStakeOnBorrowMantissa,
     test_cmp_getTotalSupplyInUSD,
     test_cmp_getBorrowedTokenList,
     test_cmp_underlyingValueInUSD,
     test_cmp_getUnderlyingPriceInUSD
}
