require('dotenv').config();

const Fs = require("fs");
const Axios = require("axios");
const CompoundMethods = require(`${process.env.libPath}/CompoundMethods.js`);
const Utils = require(`${process.env.libPath}/Utils.js`);
const Web3 = require("web3");


var fromAddress = process.env.fromAddress;
var fromPvk = process.env.fromPvk;
var web3;
var compoundMethods;

main();

async function main(){
    await writeAccounts();
}

async function init(){
    web3 = await Utils.initWeb3();
    compoundMethods = new CompoundMethods(web3, fromAddress, fromPvk);
}

//compound => accounts.json
async function writeAccounts(){
    await init();

    const filePath = "./data/compound/accounts.json";
    const rawDatafilePath = "./data/compound/accountsRawData.json";
    const blockNumber = 11333037;
    const accounts = [];

    var accountsRawResult = await compoundMethods.fetchWealthyAccounts(blockNumber);

    var accountsRaw = accountsRawResult.accounts;

    await Fs.promises.writeFile(rawDatafilePath, JSON.stringify(accountsRaw, null, 4));

    for(var i = 0; i < accountsRaw.length; i++){
        accounts.push(accountsRaw[i].address);
    }

    var data = {
        blockNumber: blockNumber,
        accounts: accounts
    }

    await Fs.promises.writeFile(filePath, JSON.stringify(data, null, 4));

    console.log(`${filePath} created!`);
}
