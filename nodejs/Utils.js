require('dotenv').config();

const NodeUtil = require('util');
const fs = require('fs');
const Web3 = require("web3");

function getContractAddress(project, contractName){
    return project.contractsMap[contractName].address;
}

function UITable(header, UIData){
    consoleHeader(header);
    console.table(UIData);

    return {};
}

function consoleHeader(text){
     console.log(text);
     console.log("============================================================================================================");
}

function consoleSpace(){
    return console.log("============================================================================================================");
}

function consoleLogFullJSON(name, value){
    console.log(name, NodeUtil.inspect(value, {showHidden: false, depth: null}));
}

function consoleLogFullJSONString(name, value){
    console.log(name, JSON.stringify(value, null, 4));
}

function toFullNumberString(number){
    return number.toLocaleString('fullwide', { useGrouping: false });
}

function structToFullJSONString(struct){
    return JSON.stringify(struct, null, 4);
}

function rawStructReturnToInput(struct){
  return JSON.parse(JSON.stringify(struct, null, 4));
}

async function createLocalJSONDataFile(fileName, jsonData){
    await fs.promises.writeFile(`${process.env.currentTestResultPATH}/testResultData/${fileName}.json`, JSON.stringify(jsonData, null, 4));
}

async function readLocalJSONDataFile(fileName){
    return JSON.parse(await fs.promises.readFile(`${process.env.currentTestResultPATH}/testResultData/${fileName}.json`, "utf8"));
}

async function readFile(path){
    return JSON.parse(await fs.promises.readFile(path, "utf8"));
}

function clone(obj){
    return JSON.parse(JSON.stringify(obj));
}

async function initWeb3(){
    return new Web3(new Web3.providers.HttpProvider(process.env.web3ProviderURL));
}

async function bulkTesting(isRunErrorData, clearErrorData, singleItemTestingFunc, errorFileName, testAccounts){
    //setting variables
    var isRunErrorData = isRunErrorData;
    var clearErrorData = clearErrorData;

    if(clearErrorData) await createLocalJSONDataFile(errorFileName, []);

    const errorAccs = await readLocalJSONDataFile(errorFileName);

    if(isRunErrorData) testAccounts = errorAccs;

    const UIData = {};

    var acc;
    for(var i = 0; i < testAccounts.length; i++){
        try{
            acc = testAccounts[i];

            if(errorAccs.includes(acc) && !isRunErrorData) continue;

            console.log(`Testing on ${acc}`);

            const UIColumn = await singleItemTestingFunc({account:acc});
            UIData[acc] = UIColumn;

          }catch(e){
              console.log(`errored!`, e.stack);
              if(isRunErrorData) break;
              errorAccs.push(acc);
              await createLocalJSONDataFile(errorFileName, errorAccs);
          }
    }

    return UIData;
}


module.exports =  {
     getContractAddress,
     consoleSpace,
     consoleLogFullJSON,
     consoleLogFullJSONString,
     toFullNumberString,
     structToFullJSONString,
     createLocalJSONDataFile,
     readLocalJSONDataFile,
     consoleHeader,
     clone,
     UITable,
     rawStructReturnToInput,
     initWeb3,
     readFile,
     bulkTesting

}
