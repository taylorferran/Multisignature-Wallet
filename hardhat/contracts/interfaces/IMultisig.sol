// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

error NotAdminAddress();
error NotMultisigMember();
error PasswordIncorrect();
error SignatoryAlreadyAdded();
error NumberOfSignaturesTooHigh();
error SignatoryIncorrectAccessLevel();
error TransactionNotSigned();
error TransactionSigned();
error TransactionInactive();
error NotEnoughETH();
error IncorrectPasswordLength();

interface IMultisig {
}