pragma solidity ^0.5.16;

contract CompoundMethodsErrorReporter{
    enum CompoundMethodsError {
        NO_ERROR,
        Liquidation_Failed,
        APPROVE_FAILED,
        Redeem_Failed
    }

    event fail(uint err);
    event fail(uint err, uint detail);
}
