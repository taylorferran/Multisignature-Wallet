const { ethers } = require("hardhat");

async function main() {

  const MultiSigContract = await ethers.getContractFactory("MultiSig");

  const deployedContract = await MultiSigContract.deploy([
    ["0xa8430797A27A652C03C46D5939a8e7698491BEd6",1],
    ["0x26fA48f0407DBa513d7AD474e95760794e5D698E",2],
    ["0xaf2D76acc5B0e496f924B08491444076219F2f35",3]], 2);

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