// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract SimpleToken is ERC20 {
  constructor(
    string memory name,
    string memory symbol //TODO: GPT this: require that substr of symbol, starting at index 1, of length symbol.len-1 is equal to same in name var
  ) ERC20(name, symbol) {

    // Convert the strings to bytes
        bytes memory nameBytes = bytes(name);
        bytes memory symbolBytes = bytes(symbol);
        
    // Ensure the symbol starts with the specified bytes
    require(symbolBytes[0]==0xe2 && symbolBytes[1]==0x93 && symbolBytes[2]==0x8b);

    // Adjust the length requirements for name and symbol
    require(nameBytes.length > 0, "Name length must be > 0");
    require(symbolBytes.length >= 4 && symbolBytes.length <= 143, "Symbol length must be between 4 and 143");

// Relationship between the lengths of name and symbol
    require(
        (symbolBytes.length == nameBytes.length + 3) ||
        (nameBytes.length > 140 && symbolBytes.length == 143), 
        "Symbol length should either be name length + 3 or exactly 143 bytes when name is over 140 bytes long"
    );

    // Ensure the substrings are the same
    bool areSubstringsEqual = true;
    uint comparisonLength = nameBytes.length;

    // If name is over 140 bytes, only compare the first 140 bytes to the symbol
    if (nameBytes.length > 140) {
        comparisonLength = 140;
    }

    for(uint i = 0; i < comparisonLength; i++) { 
        if(nameBytes[i] != symbolBytes[i+3]) {
            areSubstringsEqual = false;
            break;
        }
    }

    require(areSubstringsEqual, "The substrings do not match.");
        
    _mint(msg. sender, 10000 * 10 ** decimals());
  }
}