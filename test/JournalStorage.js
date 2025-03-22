const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("JournalStorage", function () {
  let JournalStorage, journalStorage, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    JournalStorage = await ethers.getContractFactory("JournalStorage");
    journalStorage = await JournalStorage.deploy();
    await journalStorage.waitForDeployment();    
  });

  it("Should store a journal entry and retrieve it", async function () {
    const userId = "user123@example.com";
    const title = "My First Journal";
    const ipfsHash = "QmTestJournalHash";
    const imageHashes = ["QmTestImageHash1", "QmTestImageHash2"];
    const timestamp = "2025-02-15";
    const mood = "Happy";

    await journalStorage.addJournalEntry(title, ipfsHash, imageHashes, timestamp, mood, userId);
    
    const storedJournals = await journalStorage.getJournalEntries(userId);
    expect(storedJournals.length).to.equal(1);
    expect(storedJournals[0].title).to.equal(title);
    expect(storedJournals[0].ipfsHash).to.equal(ipfsHash);
    expect(storedJournals[0].timestamp).to.equal(timestamp);
    expect(storedJournals[0].mood).to.equal(mood);
  });

  it("Should store multiple journal entries for the same user", async function () {
    const userId = "user123@example.com";
    
    await journalStorage.addJournalEntry("Journal 1", "QmHash1", ["QmImage1"], "2025-02-15", "Excited", userId);
    await journalStorage.addJournalEntry("Journal 2", "QmHash2", ["QmImage2"], "2025-02-16", "Calm", userId);
    
    const storedJournals = await journalStorage.getJournalEntries(userId);
    expect(storedJournals.length).to.equal(2);
  });

  it("Should store journals separately for different users", async function () {
    const user1 = "user123@example.com";
    const user2 = "user456@example.com";

    await journalStorage.addJournalEntry("User1 Journal", "QmUser1Hash", [], "2025-02-15", "Happy", user1);
    await journalStorage.addJournalEntry("User2 Journal", "QmUser2Hash", [], "2025-02-16", "Sad", user2);
    
    const storedJournalsUser1 = await journalStorage.getJournalEntries(user1);
    const storedJournalsUser2 = await journalStorage.getJournalEntries(user2);

    expect(storedJournalsUser1.length).to.equal(1);
    expect(storedJournalsUser2.length).to.equal(1);
  });
});
