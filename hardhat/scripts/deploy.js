const { ethers } = require("hardhat");

async function main() {

  const MultiSigContract = await ethers.getContractFactory("MultiSig");

  const deployedContract = await MultiSigContract.deploy([
    ["0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",1],
    ["0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",2],
    ["0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db",3]], 2);

  await deployedContract.deployed();

  console.log(
    "Multisig contract address: ",
    deployedContract.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});