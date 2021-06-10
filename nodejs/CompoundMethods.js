require('dotenv').config();

const axios = require('axios');
const Web3 = require("web3");
const Addresses = require("./Addresses.js");
const Utils = require("./Utils.js");
const ContractsUtils = require("./ContractsUtils.js");
const Tx = require("ethereumjs-tx");


class CompoundMethods{
    constructor(_web3, _fromAddress, _fromPvk){
        this.web3 = _web3;
        this.fromAddress = _fromAddress;
        this.fromPvk = _fromPvk;

        this.contractsUtils = new ContractsUtils(this.web3, this.fromAddress, this.fromPvk);
    }

    //min borrow - 1 ETH
    async fetchUnderWaterAccounts(blockNumber){
        const url = `https://api.compound.finance/api/v2/account?block_number=${blockNumber}&max_health[value]=1&min_borrow_value_in_eth[value]=1&page_number=1&page_size=100`;
        console.log("calling endpoint: " + url);

        const result = await axios.get(url, {timeout: 100000});

        return result.data;
    }

    async fetchWealthyAccounts(blockNumber){
        const url = `https://api.compound.finance/api/v2/account?block_number=${blockNumber}&max_health[value]=1.1&min_borrow_value_in_eth[value]=100&page_number=1&page_size=100`;
        console.log("calling endpoint: " + url);
        const result = await axios.get(url, {timeout: 100000});
        return result.data;
    }

    async supply(cTokenAddr, amount){

        const decimals = await this.getUnderlyingDecimals(cTokenAddr);
        amount = Utils.toFullNumberString(amount * 10**decimals);

        //approve
        var isUSDT = false;
        if(cTokenAddr == Addresses.findAddress("cUSDT")){
            isUSDT = true;
        }

        await this.contractsUtils.erc20Approve(await this.getUnderlyingAddr(cTokenAddr), cTokenAddr, amount, isUSDT);
        //supply

        const contract_cToken = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        var tx;
        if(cTokenAddr == Addresses.findAddress("cETH")){
            tx = await this.contractsUtils.send(contract_cToken, "mint", [], amount);
        }

        if(cTokenAddr != Addresses.findAddress("cETH")){
            tx = await this.contractsUtils.send(contract_cToken, "mint", [amount], "0");
        }
        //enter the market
        const contract_comptroller = await this.contractsUtils.loadRemoteContract(Addresses.findAddress("Comptroller"));
        const tx_enterMarkets = await this.contractsUtils.send(contract_comptroller, "enterMarkets", [[cTokenAddr]], "0");
    }


    async getUnderlyingAddr(cTokenAddr){

        if(this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cETH"))) {
            return "0x0000000000000000000000000000000000000000";
        }

        const contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);

        return await this.contractsUtils.call(contract, "underlying", []);
    }

    async getUnderlyingDecimals(cTokenAddr){

        if(this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cETH"))) {
            return 18;
        }

        const underlyingAddr = await this.getUnderlyingAddr(cTokenAddr);
        const contract = await this.contractsUtils.loadRemoteContract(underlyingAddr);
        const decimals = await this.contractsUtils.call(contract, "decimals", []);

        return decimals;
    }

    async liquidateBorrowCERC20(cTokenBorrowed, borrower, repayAmount, cTokenCollateralAddr){

        const contract = await this.contractsUtils.loadRemoteContract(cTokenBorrowed);
        const tx = await this.contractsUtils.send(contract, "liquidateBorrow", [borrower, repayAmount, cTokenCollateralAddr], "0");

        return tx;
    }

    async getUnderlyingBalanceOfAnAcc(acc, cTokenAddr){
        const contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        const cTokenBalance = await this.contractsUtils.call(contract, "balanceOf", [acc]);
        const underlyingDecimals = await this.getUnderlyingDecimals(cTokenAddr);
        const exchangeRate = await this.contractsUtils.call(contract, "exchangeRateStored");

        return (cTokenBalance * exchangeRate) / 10**18 / 10**underlyingDecimals;
    }

    async calBorrowLimitPCTPerCToken(acc, cTokenAddr){
        const comptroller_contract = await this.contractsUtils.loadRemoteContract(Addresses.findAddress("Comptroller"));
        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        //SupplyAmount, BorrowAmount
        const supplyAmount = await this.getUnderlyingBalanceOfAnAcc(acc, cTokenAddr);

        if(supplyAmount == 0) return "1";

        const collateralFactor = (await this.getCollateralFactor(cTokenAddr));

        if(collateralFactor == 0) return "1";

        const borrowAmount = await this.getBorrowAmount(acc, cTokenAddr);

        return (borrowAmount / (supplyAmount * collateralFactor)).toFixed(4);
    }

    async getAssetsIn(acc){
        const comptroller_contract = await this.contractsUtils.loadRemoteContract(Addresses.findAddress("Comptroller"));
        return await this.contractsUtils.call(comptroller_contract, "getAssetsIn", [acc]);
    }

    async getBorrowAmount(acc, cTokenAddr){
        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        const borrowAmount = await this.contractsUtils.call(cToken_contract, "borrowBalanceStored", [acc]);
        const underlyingDecimals = await this.getUnderlyingDecimals(cTokenAddr);

        return borrowAmount / 10**underlyingDecimals;
    }

    async borrow(cTokenAddr, amount){
        const underlyingDecimals = await this.getUnderlyingDecimals(cTokenAddr);
        amount = parseFloat(parseFloat(amount).toFixed(underlyingDecimals));

        const amountInput = Utils.toFullNumberString(amount * 10**underlyingDecimals);

        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);

        const borrow_tx = await this.contractsUtils.send(cToken_contract, "borrow", [amountInput], 0);

    }

    async getCollateralFactor(cTokenAddr){
        const comptroller_contract = await this.contractsUtils.loadRemoteContract(Addresses.findAddress("Comptroller"));
        const collateralFactorMantissa = (await this.contractsUtils.call(comptroller_contract, "markets", [cTokenAddr])).collateralFactorMantissa;

        return collateralFactorMantissa / 10**18;
    }

    async getPriceInUSD(cTokenAddr){
        const uniswapAnchoredView_contract = await this.contractsUtils.loadRemoteContract(Addresses.findAddress("UniswapAnchoredView"));
        const result = await this.contractsUtils.call(uniswapAnchoredView_contract, "getUnderlyingPrice", [cTokenAddr]);

        if(this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cUSDT")) || this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cUSDC"))) {
            return 1;
        }

        if(this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cWBTC")) || this.contractsUtils.isSameAddress(cTokenAddr, Addresses.findAddress("cWBTC2"))) {
            return result / 10**28;
        }
        return result / 10**18;
    }

    async getBorrowedValueInUSD(acc, cTokenAddr){
        const borrowAmount = await this.getBorrowAmount(acc, cTokenAddr);
        const priceInUSD = await this.getPriceInUSD(cTokenAddr);
        return borrowAmount * priceInUSD;
    }

    async getSuppliedValueInUSD(acc, cTokenAddr){
        const suppliedAmount = await this.getUnderlyingBalanceOfAnAcc(acc, cTokenAddr);
        const priceInUSD = await this.getPriceInUSD(cTokenAddr);
        return suppliedAmount * priceInUSD;
    }

    async getSupplyRatePerBlock(cTokenAddr){
        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        const result = await this.contractsUtils.call(cToken_contract, "supplyRatePerBlock", []);

        return result / 10**18;
    }

    async getBorrowRatePerBlock(cTokenAddr){
        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        const result = await this.contractsUtils.call(cToken_contract, "borrowRatePerBlock", []);

        return result / 10**18;
    }

    async getUnderlyingValueInUSD(amount, cTokenAddr){
        const cToken_contract = await this.contractsUtils.loadRemoteContract(cTokenAddr);
        const priceInUSD = await this.getPriceInUSD(cTokenAddr);

        return amount * priceInUSD;
    }

}




module.exports = CompoundMethods;
