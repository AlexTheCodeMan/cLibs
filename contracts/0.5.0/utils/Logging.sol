pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2;

import "./StringUtil.sol";


contract Logging is StringUtil{

    function debug(string memory name, string[] memory values) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr;

        for(uint i = 0; i < values.length; i++){
            valueStr = append(valueStr, values[i]);
            valueStr = append(valueStr, ", ");
        }

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, address[] memory values) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr;

        for(uint i = 0; i < values.length; i++){
            valueStr = append(valueStr, address2str(values[i]));
            valueStr = append(valueStr, ", ");
        }

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, uint[] memory values) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr;

        for(uint i = 0; i < values.length; i++){
            valueStr = append(valueStr, uint2str(values[i]));
            valueStr = append(valueStr, ", ");
        }

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, string memory value) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr = value;

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, address value) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr = address2str(value);

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, uint value) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr = uint2str(value);

        require(false, append(log_name, valueStr));
    }

    function debug(string memory name, bool value) internal pure{
        string memory log_name = append(name, ": ");
        string memory valueStr = bool2str(value);

        require(false, append(log_name, valueStr));
    }



    event log(string name, address value);
    event log(string name, uint value);
    event log(string name, string value);
    event log(string name, bool value);
    event log(string name, uint[] value);
    event log(string name, address[] value);

}
