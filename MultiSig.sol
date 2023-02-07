// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/// @title A multisig wallet for the Openfort code challenge
/// @author Taylor Ferran

contract MultiSig {

    mapping (address => uint256) public signatorieDetails;
    mapping (uint256 => transaction) public transactionMapping;
    mapping (address => mapping (uint256 => bool)) public isTransactionSigned;

    uint128 public numberOfSignatures;
    uint128 public numberOfTransactions;

    struct signatorieListStruct {
        address signatorieAddress;
        uint128 signatorieRole;
    }

    struct transaction {
        address depositAddress;
        uint128 signatures;
        uint256 amount;
        bool active;
    }

    signatorieListStruct[] public signatorieList;

    /// @notice Check if an address is a member of the multisig
    modifier isAddressMemberOfMultisig() {
        require(signatorieDetails[msg.sender] > 0, "Wallet not a member of this multi sig.");
        _;
    }

    constructor (signatorieListStruct[] memory _signatorieList, uint8 _numberOfSignatures) {

        for(uint256 i=0; i<_signatorieList.length; ++i) {
            signatorieDetails[_signatorieList[i].signatorieAddress] = _signatorieList[i].signatorieRole;
            signatorieList.push(_signatorieList[i]);
        }

        numberOfSignatures = _numberOfSignatures;
    }

    function createTransaction(address _depositAddress, uint256 _amount) 
    public isAddressMemberOfMultisig() returns(uint128) {

        // Create 
        transaction memory newTransaction = transaction(
            {
                depositAddress : _depositAddress,
                signatures : numberOfSignatures,
                amount : _amount,
                active : true
            }
        );

        ++numberOfTransactions;
        transactionMapping[numberOfTransactions] = newTransaction;
        return(numberOfTransactions);
    }

    function signTransaction(uint128 _transactionID) 
    public isAddressMemberOfMultisig() {

        require(transactionMapping[_transactionID].active, "Txn inactive");
        require(!isTransactionSigned[msg.sender][_transactionID], "Txn already signed by this address");
        isTransactionSigned[msg.sender][_transactionID] = true;
        --transactionMapping[_transactionID].signatures;

        transaction memory localTxn = transactionMapping[_transactionID];

        if(localTxn.signatures == 0) {
            (bool sent,) = localTxn.depositAddress.call{value: localTxn.amount}("");
            require(sent);
            transactionMapping[_transactionID].active = false;
        }
    }

    function unsignTransaction(uint128 _transactionID) 
    public isAddressMemberOfMultisig(){

        require(isTransactionSigned[msg.sender][_transactionID], "Txn not signed by this address");
        isTransactionSigned[msg.sender][_transactionID] = false;
        ++transactionMapping[_transactionID].signatures;
    }

    function cancelTransaction(uint128 _transactionID) 
    public isAddressMemberOfMultisig() {
        require(signatorieDetails[msg.sender] <= 2);
        transactionMapping[_transactionID].active = false;
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

}