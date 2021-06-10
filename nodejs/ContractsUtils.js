const fs = require('fs');
const Tx = require("ethereumjs-tx");
const axios = require('axios');
const AbiDecoder = require('abi-decoder');
const Utils = require(`${process.env.libPath}/Utils.js`);
const Addresses = require("./Addresses");
const Web3 = require("web3");

require('dotenv').config();

class ContractsUtils{

    constructor(_web3, _fromAddress, _fromPvk) {
            this.web3 = _web3;
            this.fromAddress = _fromAddress;
            this.fromPvk = _fromPvk;
    }

    async uintTestSingleCallFunction(TestData, contract, functionName){
        const dataSet = await TestData[functionName]();
        const results = [];
        for(var i = 0; i < dataSet.length; i++){
            const data = dataSet[i];
            const r = await this.call(contract, functionName, data);
            const result = {
                testData: data,
                result: r
            }
            results.push(result);
        }

        return results;
    }

    async uintTestSingleCallFunction(TestData, contract, functionName){
        const dataSet = await TestData[functionName]();
        const results = [];
        for(var i = 0; i < dataSet.length; i++){
            const data = dataSet[i];
            const r = await this.call(contract, functionName, data);
            const result = {
                testData: data,
                result: r
            }
            results.push(result);
        }

        return results;
    }


    //if tokenAddr = "0x0000000000000000000000000000000000000000", it's ETH
    async balanceOf(account, tokenAddr){
        if(tokenAddr == "0x0000000000000000000000000000000000000000"){
            return await this.web3.eth.getBalance(account);
        }

        const erc20 = await this.ERC20(tokenAddr);
        return await this.call(erc20, "balanceOf", [account]);
    }

    async ERC20(address){
        const erc20ABI = await this.getStandardABI("ERC20");
        const erc20 = await new this.web3.eth.Contract(erc20ABI, address);

        return erc20;
    }

    async getDecimals(address){
        if(address == "0x0000000000000000000000000000000000000000" ){
            return "18";
        }

        const erc20 = await this.ERC20(address);

        return await this.call(erc20, "decimals", []);
    }

    async erc20Approve(erc20Addr, spender, amount, isUSDT){
        const erc20 = await this.ERC20(erc20Addr);

        if(isUSDT){
            const txData = erc20.methods.approve(spender, 0);
            const tx = await this.sendTx(erc20Addr, txData, "0");
        }

        const txData = erc20.methods.approve(spender, amount);
        const tx = await this.sendTx(erc20Addr, txData, "0");

        return tx;
    }

    async ethTransfer(to, amount){

        const txData = "0x";
        const tx = await this.sendTx(to, txData, amount);

        return tx;
    }

    async erc20Transfer(tokenAddr, to, amount){
        const erc20ABI = await this.getStandardABI("ERC20");
        const erc20 = await new this.web3.eth.Contract(erc20ABI, tokenAddr);

        const txData = erc20.methods.transfer(to, amount);
        const tx = await this.sendTx(tokenAddr, txData, "0");

        return tx;
    }

    async getEventParams(txHash, eventName){
        var txnReceipt = await this.web3.eth.getTransactionReceipt(txHash);
        const logs = txnReceipt.logs;

        if(logs.length > 0){

              AbiDecoder.addABI(await await quickFindEtherscanABI(txnReceipt.to));

              var decodedLogs = AbiDecoder.decodeLogs(txnReceipt.logs);

              for(var x = 0; x < decodedLogs.length; x++){
                  if(decodedLogs[x] && decodedLogs[x].name == eventName){
                      return decodedLogs[x].events;
                  }
              }
          }
    }

    //this is the truffle abis from the truffle project itself
    async getLocalABI(projectPath, contractName){

        const fileName = `${contractName}.json`;
        const filePath = `${projectPath}/build/contracts/${fileName}`;
        const fileBody = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

        return fileBody.abi;
    }

    async getStandardABI(contractName){
      const fileName = `${contractName}.json`;
      const filePath = `${process.env.libPath}/abi/${fileName}`;
      const fileBody = JSON.parse(await fs.promises.readFile(filePath, "utf8"));

      return fileBody;
    }

    async quickFindEtherscanABI(contractAddress){
        contractAddress = Web3.utils.toChecksumAddress(contractAddress);

        const cachePATH = `${process.env.libPath}/abi/cachedEtherscanABIs`;
        const abiPATH = `${cachePATH}/${contractAddress}.json`;
        try{
            const abi = JSON.parse(await fs.promises.readFile(abiPATH, "utf8"));
            return abi;
        }catch(e){
            const abi = await this.findEtherscanABI(contractAddress);

            //cache the result
            await fs.promises.writeFile(abiPATH, JSON.stringify(abi, null, 4));

            return abi;
        }
    }

    async findEtherscanABI(contractAddress){
        try{
            const etherscanGetAbiUrl = "https://api.etherscan.io/api?module=contract&action=getabi"
                                      + "&address=" + contractAddress
                                      + "&apikey=" + process.env.etherscanApiKey;
            const etherscanABI = (await axios.get(etherscanGetAbiUrl)).data.result;

            return JSON.parse(etherscanABI);

        }catch(e){
            console.log("findEtherscanABI error: ", e);
            console.log("ABI not found - error in findEtherscanABI - contractAddress: ", contractAddress);
            return null;
        }
    }

    async call(contract, functionName, params){
        return contract.methods[functionName].apply(this, params).call();
    }

    async send(contract, functionName, params, wei_value){

        const txData = contract.methods[functionName].apply(this, params);

        const tx_receipt = await this.sendTx(contract._address, txData, wei_value);

        return tx_receipt;
    }

    async loadLocalContractByProject(contractName, project){
        return await this.loadLocalContract(contractName, project.contractsMap[contractName].address, project.projectPATH);
    }

    async loadLocalContract(contractName, contractAddr, projectPATH){
        const contractABI = await this.getLocalABI(projectPATH, contractName);
        const contract = await new this.web3.eth.Contract(contractABI, contractAddr);

        return contract;
    }

    async loadRemoteContract(contractAddr){

        var implementationAddr = await Addresses.findImplmentationAddress(contractAddr);

        if(!implementationAddr){
            implementationAddr = contractAddr;
        }

        const contractABI = await this.quickFindEtherscanABI(implementationAddr);
        const contract = await new this.web3.eth.Contract(contractABI, contractAddr);

        return contract;
    }

    async sendTx(to, txData, value){
          if(this.isUnlockedAcc(this.fromAddress)){
              return await txData.send({from: this.fromAddress});
          }

          const tx_raw = {
                          to: to,
                          from: this.fromAddress,
                          data: txData.encodeABI(),
                          value: this.web3.utils.toHex(value)
                        };

          var tx = new Tx.Transaction(tx_raw);
          const count = await this.web3.eth.getTransactionCount(this.fromAddress);

          const gasCost = await this.web3.eth.estimateGas(tx_raw);
          const gasPrice = await this.web3.eth.getGasPrice();

          tx_raw.nonce = this.web3.utils.toHex(count);
          tx_raw.gasLimit = this.web3.utils.toHex(gasCost);
          tx_raw.gasPrice = this.web3.utils.toHex(gasPrice);

          var tx = new Tx.Transaction(tx_raw);

          const pvk_hex = Buffer.from(this.fromPvk, 'hex');

          tx.sign(pvk_hex);

          const signed_tx = "0x" + tx.serialize().toString("hex");
          const result = await this.web3.eth.sendSignedTransaction(signed_tx);

          return result;
    }

    isUnlockedAcc(acc){
        const unlockedAccs = JSON.parse(process.env.unlock);
        for(var i = 0; i < unlockedAccs.length; i++){
            if(unlockedAccs[i] == acc) return true;
        }

        return false;
    }

    isSameAddress(a, b){
        return (this.web3.utils.toChecksumAddress(a) == this.web3.utils.toChecksumAddress(b));
    }

}
module.exports =  ContractsUtils;
