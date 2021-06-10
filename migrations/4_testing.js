const axios = require('axios')
require('dotenv').config();

const Contract1 = artifacts.require("./Test.sol");

module.exports = function(deployer) {
    //comment this out when testing is not required
    testContracts();

}



async function testContracts(){
    const deployedContract1 = await Contract1.deployed();

    const projectName = "cLibs";
    const contract1_Name = "Test";
    const contractMap = {};

    contractMap[contract1_Name] = {
                                      address: deployedContract1.address,
                                  }

    const args = {
                   projectName: projectName,
                   projectPATH: __dirname.replace("/migrations", ""),
                   contractsMap: contractMap
                }


    console.log("arg", args);
    await axios.post("http://127.0.0.1:8301/testContracts", args);
}


//this actual testing go here...
//warning: use getBlockNumber api for the forked block number instead of block.number in truffle...
