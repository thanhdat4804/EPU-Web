const { ethers } = require("hardhat");

async function main() {
  const [owner, bidder1, bidder2,bidder3] = await ethers.getSigners();

  // Địa chỉ contract sau khi deploy (copy từ deploy.js log ra)
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Kết nối tới contract
  const action = await ethers.getContractAt("Action", contractAddress);

  console.log("Action contract loaded at:", action.target); // ethers v6 dùng .target thay cho .address

  // Bidder 1 đặt 1 ETH
  const tx1 = await action.connect(bidder1).bid({ value: ethers.parseEther("1.0") });
  await tx1.wait();
  console.log("Bidder 1 đặt 1 ETH");

  // Bidder 2 đặt 2 ETH
  const tx2 = await action.connect(bidder2).bid({ value: ethers.parseEther("2.0") });
  await tx2.wait();
  console.log("Bidder 2 đặt 2 ETH");

  // Bidder 3 đặt 10 ETH
  const tx3 = await action.connect(bidder3).bid({ value: ethers.parseEther("10.0") });
  await tx3.wait();
  console.log("Bidder 3 đặt 10 ETH");
  // Lấy thông tin highest bid
  const highestBid = await action.highestBid();
  const highestBidder = await action.highestBidder();
  console.log("Highest Bid:", ethers.formatEther(highestBid), "ETH");
  console.log("Highest Bidder:", highestBidder);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
