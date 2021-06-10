require('dotenv').config();
const fs = require('fs');
const axios = require('axios');

const { exec, spawn } = require("child_process");

const Web3 = require("web3");
const web3ProviderURL = process.env.web3ProviderURL;
const UniswapMethods = require("./UniswapMethods");



class DevNode{
    constructor(_web3, _fromAddress, _fromPvk){
        this.web3 = _web3;
        this.fromAddress = _fromAddress;
        this.fromPvk = _fromPvk;
        this.isNodeUp = null;
        this.ganacheProcessPID = null;
        this.forkedBlockNumber = null;

        this.uniswapMethods = new UniswapMethods(this.web3, this.fromAddress, this.fromPvk);
    }


    async sendTestCoins(recipient){
        const testCoins = JSON.parse(process.env.testCoins);
        const testCoinsAmounts = JSON.parse(process.env.testCoinsAmounts);

        for(var i = 0; i < testCoins.length; i++){
            await this.uniswapMethods.receiveTokenByETH(recipient, testCoins[i], testCoinsAmounts[i]);
            console.log(`Test ${testCoins[i]} sent ${testCoinsAmounts[i]}`);
        }
    }

    async sendTestCoins_custom(recipient, symbol, amount){
        await this.uniswapMethods.receiveTokenByETH(recipient, symbol, amount);
        console.log(`Test ${symbol} sent!`);
    }

    async startGanache(blockNumber){

        this.forkedBlockNumber = blockNumber;

        var cmd;

        if(blockNumber != 'latest'){
            cmd = `ganache-cli ${process.env.GanacheAccountCmdStr} --fork ${process.env.archievedNodeURL}@${blockNumber} `;
        }else{
            cmd = `ganache-cli ${process.env.GanacheAccountCmdStr} --fork ${process.env.archievedNodeURL} `;
        }

        const unlockAccs = JSON.parse(process.env.unlock);
        for(var i = 0; i < unlockAccs.length; i++){
            cmd += `--unlock ${unlockAccs[i]}`;
        }
        console.log("cmd", cmd);
        console.log("Ganache PID:", this.ganacheProcessPID);

        await exec(`kill -9 ${this.ganacheProcessPID}`);
        await exec(`kill -9 ${parseInt(this.ganacheProcessPID)+1}`);

        this.ganacheProcessPID = (await exec(cmd, (err, stdout, stderr) => {
                                      if (stderr) {
                                          console.log(stderr);
                                          throw new Error('Start Ganache Failed!');
                                       }
                                    })
                            ).pid;


        await this.checkNodeStatus();

        if(!(await this.isRefreshedNode())){
            throw new Error('This is not a refreshed node!');
        }
    }


    async isRefreshedNode(){
        if(this.forkedBlockNumber == 'latest') return true;

        const nodeBlockNumber = await this.web3.eth.getBlockNumber();

        if((nodeBlockNumber - 1) == this.forkedBlockNumber){
            return true;
        }

        return false;
    }

    async truffleMigrate(truffleProjectPath){
        const cmd = `cd ${truffleProjectPath} && truffle compile && truffle migrate --reset`;
        exec(cmd);
        console.log(`Migrating contracts...`);
    }

    async checkNodeStatus(){
        try{
            await this.web3.eth.getAccounts();
            this.isNodeUp = true;
        }catch(e){
            this.isNodeUp = false;
            await this.checkNodeStatus();
        }
    }

    async mine(numberOfBlocks){

        const data = {"id":1337,"jsonrpc":"2.0","method":"evm_mine","params":[]};
        const header = {'Content-Type': 'application/json'};

        for(var i = 0; i < numberOfBlocks; i++){
            await axios.post(process.env.web3ProviderURL, data, header);
        }

    }
}

module.exports = DevNode
