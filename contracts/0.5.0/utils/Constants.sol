pragma solidity ^0.5.16;

contract Constants{
    uint internal constant oneMantissa = 10**18;

    enum LoopControl {
        NONE,
        CONTINUE,
        BREAK
    }
}
