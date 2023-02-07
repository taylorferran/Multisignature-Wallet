// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

/// @title A multisig wallet for the Openfort code challenge
/// @author Taylor Ferran

contract MultiSig {

    mapping (address => uint256) public signatoryDetails;
    mapping (uint256 => transaction) public transactionMapping;
    mapping (address => mapping (uint256 => bool)) public isTransactionSigned;
    mapping (address => bytes32) public addressPasswordHash;

    uint128 public numberOfSignatures;
    uint128 public numberOfTransactions;

    struct signatoryListStruct {
        address signatoryAddress;
        uint128 signatoryRole;
    }

    struct transaction {
        address depositAddress;
        uint128 signatures;
        uint256 amount;
        bool active;
    }

    signatoryListStruct[] public signatoryList;

    /// @notice Check if an address is a member of the multisig
    modifier isAddressMemberOfMultisig() {
        require(signatoryDetails[msg.sender] > 0, "Wallet not a member of this multi sig.");
        _;
    }

    constructor (signatoryListStruct[] memory _signatoryList, uint8 _numberOfSignatures) {

        for(uint256 i=0; i<_signatoryList.length; ++i) {
            signatoryDetails[_signatoryList[i].signatoryAddress] = _signatoryList[i].signatoryRole;
            signatoryList.push(_signatoryList[i]);
        }

        numberOfSignatures = _numberOfSignatures;
    }

    function deposit () public payable {

    }

    function createTransaction(address _depositAddress, uint256 _amount) 
    public isAddressMemberOfMultisig() returns(uint128) {

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
    public {

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

    function signTransactionWithKey(uint128 _transactionID) 
    public isAddressMemberOfMultisig() {
        signTransaction(_transactionID);
    }

    /// @notice Single use recovery function
    function signTransactionWithPassword(uint128 _transactionID, address _account, string memory _password) 
    public {
        require(generatePasswordHash(_password) == addressPasswordHash[_account]);
        signTransaction(_transactionID);
    }

    function unsignTransaction(uint128 _transactionID) 
    public isAddressMemberOfMultisig(){

        require(isTransactionSigned[msg.sender][_transactionID], "Txn not signed by this address");
        isTransactionSigned[msg.sender][_transactionID] = false;
        ++transactionMapping[_transactionID].signatures;
    }

    function cancelTransaction(uint128 _transactionID) 
    public isAddressMemberOfMultisig() {
        require(signatoryDetails[msg.sender] <= 2);
        transactionMapping[_transactionID].active = false;
    }

    function assignPasswordHash(bytes32 _passwordHash) 
    public isAddressMemberOfMultisig() {
        addressPasswordHash[msg.sender] = _passwordHash;
    }

    /// @notice View functions

    function generatePasswordHash(string memory _passwordHash) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_passwordHash));
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

}