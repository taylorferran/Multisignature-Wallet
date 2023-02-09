//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "./MultiSig.sol";

contract Factory {

   MultiSig[] public multiSigArray;

   function createNewMultiSig(MultiSig.signatoryListStruct[] memory _signatoryList, uint8 _numberOfSignatures) public {
     MultiSig multisig = new MultiSig(_signatoryList, _numberOfSignatures);
     MultiSigArray.push(multisig);
   }
}
