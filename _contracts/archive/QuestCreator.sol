// SPDX-License-Identifier: MIT
pragma solidity =0.8.17;

import "./SimpleToken.sol";

contract QuestCreator {
  address[] public tokens;

  event TokenCreated(address tokenAddress, address owner);

  function createToken(
    string calldata name,
    string calldata symbol,
    address owner
  ) internal returns (address) {
    // Compute the salt using the kind and content parameters
    bytes32 _salt = keccak256('Open Value'); //placeholder, TODO CHANGE/VERIFY to AUTHENTicATE OUR CONTRACTS FROM FAKE

    // Create the contract using create2 with the salt
    SimpleToken ST = new SimpleToken{salt: _salt}(name, symbol);

    tokens.push(address(ST));
    emit TokenCreated(address(ST), owner);
    return address(ST);
  }

  function getTokenCount() public view returns (uint) {
    return tokens.length;
  }
}