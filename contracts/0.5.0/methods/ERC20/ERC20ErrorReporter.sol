pragma solidity ^0.5.16;

contract ERC20ErrorReporter{
    enum ERC20Error {
        NO_ERROR,
        TRANSFER_FROM_FAILED,
        APPROVE_FAILED,
        TRANSFER_FAILED
    }

    event fail(uint err);
}
