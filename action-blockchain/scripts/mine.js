// scripts/mine.js
async function main() {
  console.log("Đang tự động đào block mỗi 2 giây...");
  while (true) {
    await network.provider.send("evm_mine", []);
    await new Promise(r => setTimeout(r, 2000));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});