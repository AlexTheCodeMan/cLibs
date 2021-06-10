require('dotenv').config();
const axios = require('axios');
const Web3 = require("web3");
const Addresses = require("./Addresses.js");
const Utils = require("./Utils");
const ContractsUtils = require("./ContractsUtils.js");
const Tx = require("ethereumjs-tx");

const vaultAddress = process.env.vaultAddress;
const vaultPvk = process.env.vaultPvk;

var web3;
var fromAddress;
var fromPvk;
var contractsUtils;

class UniswapMethods{
    constructor(_web3, _fromAddress, _fromPvk){
        this.web3 = _web3;
        this.fromAddress = _fromAddress;
        this.fromPvk = _fromPvk;

        this.contractsUtils = new ContractsUtils(this.web3, this.fromAddress, this.fromPvk);
    }

    async receiveTokenByETH(recipientAddress, tokenSymbol, amountOut){

        const contractsUtils_vault = new ContractsUtils(this.web3, vaultAddress, vaultPvk);

        const decimals = await contractsUtils_vault.getDecimals(Addresses.findAddress(tokenSymbol));
        amountOut = Utils.toFullNumberString(amountOut * 10**decimals);

        const uniswapV2Router02Address = await Addresses.findAddress("UniswapV2Router02");

        //call swap function
        const uniswapV2Router02Contract = await new this.web3.eth.Contract(await contractsUtils_vault.quickFindEtherscanABI(uniswapV2Router02Address), uniswapV2Router02Address);

        const path = [Addresses.findAddress("WETH"), Addresses.findAddress(tokenSymbol)];
        const uniswapCalculatedAmountIn = (await uniswapV2Router02Contract.methods.getAmountsIn(amountOut, path).call())[0];

        const slippage = 0.05;
        const amountOutMin = this.toBigNumber((Number(amountOut) * (1 - slippage)));
        const deadline = this.getUnixTimestamp(this.getTomorrow());


        const swapExactTokensForETH_TxData = uniswapV2Router02Contract.methods.swapExactETHForTokens(amountOutMin, path, recipientAddress, deadline);
        const swapExactTokensForETH_Result = await contractsUtils_vault.sendTx(uniswapV2Router02Address, swapExactTokensForETH_TxData, uniswapCalculatedAmountIn);

        return swapExactTokensForETH_Result;
    }

    getUnixTimestamp(date){
        return Math.floor(date.getTime() / 1000);
    }

    getTomorrow(){
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return tomorrow;
    }

    toBigNumber(number){
        return this.web3.utils.toBN(number.toLocaleString('fullwide', {useGrouping:false}));
    }


}

module.exports = UniswapMethods;
