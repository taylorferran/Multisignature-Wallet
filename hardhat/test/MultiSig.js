const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("Openfort Multisignature wallet contract tests", function () {
  it("Create a transaction as a signatory", async function () {

    const [addr1, addr2, addr3] = await ethers.getSigners();

    const constructorArray = [
      [addr1.address,1],
      [addr2.address,2],
      [addr3.address,3]];

    const MultiSig = await ethers.getContractFactory("MultiSig");

    // Deploy contract with addressses shown above and with 2 signatures needed
    const MultisigContract = await MultiSig.deploy(constructorArray, 2);

    // No transactions created yet
    expect(await MultisigContract.numberOfTransactions()).to.equal(0);

    // Address 1 creates a transaction to send 1 wei to address 2
    await MultisigContract.connect(addr1).createTransaction(addr2.address, 1);

    // Check transaction created
    expect(await MultisigContract.numberOfTransactions()).to.equal(1);

  });

  it("Can't create a transaction if not a signatory", async function () {

    const [addr1, addr2, addr3, addr4] = await ethers.getSigners();

    const constructorArray = [
      [addr1.address,1],
      [addr2.address,2],
      [addr3.address,3]];

    const MultiSig = await ethers.getContractFactory("MultiSig");

    // Deploy contract with addressses shown above and with 2 signatures needed
    const MultisigContract = await MultiSig.deploy(constructorArray, 2);

    // No transactions created yet
    expect(await MultisigContract.numberOfTransactions()).to.equal(0);

    // Transaction should revert as address 4 is not included in the multisig
    await expect (
      MultisigContract.connect(addr4).createTransaction(addr2.address, 1)
    ).to.be.revertedWith("Wallet not a member of this multi sig");

    // Check transaction created
    expect(await MultisigContract.numberOfTransactions()).to.equal(0);

  });

    it("Can sign a transaction if a signatory and transaction processes", async function () {
  
      const [addr1, addr2, addr3] = await ethers.getSigners();
  
      const constructorArray = [
        [addr1.address,1],
        [addr2.address,2],
        [addr3.address,3]];
  
      const MultiSig = await ethers.getContractFactory("MultiSig");
  
      // Deploy contract with addressses shown above and with 2 signatures needed
      const MultisigContract = await MultiSig.deploy(constructorArray, 2);
  
      // No transactions created yet
      expect(await MultisigContract.numberOfTransactions()).to.equal(0);
  
      // Address 1 creates a transaction to send 1 wei to address 2
      await MultisigContract.connect(addr1).createTransaction(addr2.address, 1);
  
      // Check transaction created
      expect(await MultisigContract.numberOfTransactions()).to.equal(1);

      // Check it's active 
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(true);

      // Deposit some eth into contract
      await MultisigContract.connect(addr1).deposit( { value: ethers.utils.parseEther("0.2") });

      // Check signature unsigned in mapping 
      transactionSigned = await MultisigContract.connect(addr1).isTransactionSigned(addr1.address,1);
      expect(transactionSigned).to.equal(false);

      // Address 1 signs
      await MultisigContract.connect(addr1).signTransactionWithKey(1);

      // Check signature reflected in mapping 
      transactionSigned = await MultisigContract.connect(addr1).isTransactionSigned(addr1.address,1);
      expect(transactionSigned).to.equal(true);

      // Address 2 signs
      await MultisigContract.connect(addr2).signTransactionWithKey(1);

      // Check it's inactive and has been processed
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(false);  
    });

    it("Can unsign a transaction", async function () {
  
      const [addr1, addr2, addr3] = await ethers.getSigners();
  
      const constructorArray = [
        [addr1.address,1],
        [addr2.address,2],
        [addr3.address,3]];
  
      const MultiSig = await ethers.getContractFactory("MultiSig");
  
      // Deploy contract with addressses shown above and with 2 signatures needed
      const MultisigContract = await MultiSig.deploy(constructorArray, 2);
  
      // No transactions created yet
      expect(await MultisigContract.numberOfTransactions()).to.equal(0);
  
      // Address 1 creates a transaction to send 1 wei to address 2
      await MultisigContract.connect(addr1).createTransaction(addr2.address, 1);
  
      // Check transaction created
      expect(await MultisigContract.numberOfTransactions()).to.equal(1);

      // Check it's active 
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(true);

      // Deposit some eth into contract
      await MultisigContract.connect(addr1).deposit( { value: ethers.utils.parseEther("0.2") });

      // Check signature unsigned in mapping 
      transactionSigned = await MultisigContract.connect(addr1).isTransactionSigned(addr1.address,1);
      expect(transactionSigned).to.equal(false);

      // Address 1 signs
      await MultisigContract.connect(addr1).signTransactionWithKey(1);

      // Check signature reflected in mapping 
      transactionSigned = await MultisigContract.connect(addr1).isTransactionSigned(addr1.address,1);
      expect(transactionSigned).to.equal(true);

      // Address 1 unsigns
      await MultisigContract.connect(addr1).unsignTransaction(1);

      // Check signature reflected in mapping 
      transactionSigned = await MultisigContract.connect(addr1).isTransactionSigned(addr1.address,1);
      expect(transactionSigned).to.equal(false);

    });

    it("Can cancel a transaction only if level 2 or above", async function () {
  
      const [addr1, addr2, addr3] = await ethers.getSigners();
  
      const constructorArray = [
        [addr1.address,1],
        [addr2.address,2],
        [addr3.address,3]];
  
      const MultiSig = await ethers.getContractFactory("MultiSig");
  
      // Deploy contract with addressses shown above and with 2 signatures needed
      const MultisigContract = await MultiSig.deploy(constructorArray, 2);
  
      // No transactions created yet
      expect(await MultisigContract.numberOfTransactions()).to.equal(0);
  
      // Address 1 creates a transaction to send 1 wei to address 2
      await MultisigContract.connect(addr1).createTransaction(addr2.address, 1);
  
      // Check transaction created
      expect(await MultisigContract.numberOfTransactions()).to.equal(1);

      // Check it's active 
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(true);

      // Level 3 account fails to cancel transaction 
      await expect (
        MultisigContract.connect(addr3).cancelTransaction(1)
      ).to.be.revertedWith("Address does not have the correct access level to cancel transactions");

      // Check it's still active 
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(true);

      // Level 2 account tries to cancel transaction 
      await MultisigContract.connect(addr2).cancelTransaction(1);

      // Check it's now inactive 
      transaction = await MultisigContract.transactionMapping(1);
      expect(await transaction[2]).to.equal(false);


    });
});