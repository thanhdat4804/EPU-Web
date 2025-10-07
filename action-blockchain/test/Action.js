const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Action", function () {
  let Action, action, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Action = await ethers.getContractFactory("Action");
    action = await Action.deploy(60); // thời gian đấu giá 60 giây
    await action.waitForDeployment();
  });

  it("Should allow bids and update highest bidder", async function () {
    await action.connect(addr1).bid({ value: ethers.parseEther("1.0") });
    expect(await action.highestBid()).to.equal(ethers.parseEther("1.0"));
    expect(await action.highestBidder()).to.equal(addr1.address);
  });

  it("Should reject lower bids", async function () {
    await action.connect(addr1).bid({ value: ethers.parseEther("1.0") });
    await expect(
  action.connect(addr2).bid({ value: ethers.parseEther("0.5") })
).to.be.revertedWith("Bid not high enough");

  });

  it("Should finalize and send funds to seller", async function () {
    await action.connect(addr1).bid({ value: ethers.parseEther("2.0") });
    await ethers.provider.send("evm_increaseTime", [70]); // tăng thời gian 70s
    await ethers.provider.send("evm_mine", []);
    await action.finalize();

    expect(await ethers.provider.getBalance(owner.address)).to.be.above(
      ethers.parseEther("10000")
    );
  });
});
