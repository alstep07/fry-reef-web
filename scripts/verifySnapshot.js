const fs = require("fs");
const path = require("path");

/**
 * Verify snapshot contents
 */

const snapshotDir = path.join(__dirname, "../snapshots");
const files = fs
  .readdirSync(snapshotDir)
  .filter((f) => f.startsWith("snapshot-") && f.endsWith(".json"))
  .sort()
  .reverse();

const snapshotPath = path.join(snapshotDir, files[0]);
console.log(`📂 Loading snapshot: ${files[0]}\n`);
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

console.log("USER | FISH | EGGS | PS | SD | CAPACITY | STARTER");
console.log("-".repeat(80));

let totalFish = 0;
let totalEggs = 0;

const users = Object.keys(snapshot.users).sort();
for (const userAddress of users) {
  const userData = snapshot.users[userAddress];
  const fishCount = userData.fish.length;
  const eggsCount = userData.eggs.length;
  const ps = userData.pearlShards;
  const sd = Math.floor(Number(userData.spawnDust) / 1e18);
  const capacity = userData.reefCapacity;
  const starter = userData.starterPackClaimed ? "✓" : "✗";

  totalFish += fishCount;
  totalEggs += eggsCount;

  console.log(
    `${userAddress.slice(0, 10)}... | ${String(fishCount).padEnd(4)} | ${String(
      eggsCount,
    ).padEnd(4)} | ${String(ps).padEnd(2)} | ${String(sd).padEnd(4)} | ${String(
      capacity,
    ).padEnd(8)} | ${starter}`,
  );
}

console.log("-".repeat(80));
console.log(
  `\nTotal: ${totalFish} fish, ${totalEggs} eggs across ${users.length} users`,
);
