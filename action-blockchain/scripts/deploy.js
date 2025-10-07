const hre = require("hardhat");

async function main() {
  const Factory = await hre.ethers.getContractFactory("ActionFactory");
  const factory = await Factory.deploy();

  await factory.waitForDeployment();
  const address = await factory.getAddress();
  console.log("✅ ActionFactory deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
