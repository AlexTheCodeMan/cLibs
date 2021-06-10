pragma solidity ^0.5.16;

contract UniswapV2MethodsErrorReporter{
    enum UniswapV2MethodsError {
        NO_ERROR,
        APPROVE_FAILED,
        SWAP_FAILED
    }
    event fail(uint err, uint detail);
    event fail(uint err);

}
