pragma solidity ^0.5.16;

contract ArrayUtil{
      
      function quickSortDESC(string[] memory keys, uint[] memory values) internal pure returns (string[] memory, uint[] memory){

            string[] memory keysPlus = new string[](keys.length + 1);
            uint[] memory valuesPlus = new uint[](values.length + 1);

            for(uint i = 0; i < keys.length; i++){
                keysPlus[i] = keys[i];
                valuesPlus[i] = values[i];
            }

            (keysPlus, valuesPlus) = quickSort(keysPlus, valuesPlus, 0, keysPlus.length - 1);

            string[] memory keys_desc = new string[](keys.length);
            uint[] memory values_desc = new uint[](values.length);
            for(uint i = 0; i < keys.length; i++){
                keys_desc[keys.length - 1 - i] = keysPlus[i + 1];
                values_desc[keys.length - 1 - i] = valuesPlus[i + 1];
            }

            return (keys_desc, values_desc);
      }

      function quickSort(string[] memory keys, uint[] memory values, uint left, uint right) internal pure returns (string[] memory, uint[] memory){
            uint i = left;
            uint j = right;
            uint pivot = values[left + (right - left) / 2];
            while (i <= j) {
                while (values[i] < pivot) i++;
                while (pivot < values[j]) j--;
                if (i <= j) {
                    (keys[i], keys[j]) = (keys[j], keys[i]);
                    (values[i], values[j]) = (values[j], values[i]);
                    i++;
                    j--;
                }
            }
            if (left < j)
                quickSort(keys, values, left, j);

            if (i < right)
                quickSort(keys, values, i, right);

                return (keys, values);
      }
}
