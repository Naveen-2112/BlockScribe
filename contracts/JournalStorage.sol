// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract JournalStorage {
    struct JournalEntry {
        string title;
        string ipfsHash;
        string[] imageHashes;
        string timestamp;
        string mood;
    }

    // Instead of msg.sender, we use a manually provided user ID (hashed for privacy)
    mapping(bytes32 => JournalEntry[]) private userJournals;

    event JournalAdded(bytes32 indexed userId, string title, string ipfsHash, string timestamp, string mood);

    function addJournalEntry(
        string memory _title, 
        string memory _ipfsHash, 
        string[] memory _imageHashes, 
        string memory _timestamp, 
        string memory _mood,
        string memory _userId // Accept user ID from Google OAuth
    ) public {
        bytes32 hashedUserId = keccak256(abi.encodePacked(_userId)); // Hash for privacy
        userJournals[hashedUserId].push(JournalEntry(_title, _ipfsHash, _imageHashes, _timestamp, _mood));
        emit JournalAdded(hashedUserId, _title, _ipfsHash, _timestamp, _mood);
    }

    function getJournalEntries(string memory _userId) public view returns (JournalEntry[] memory) {
        bytes32 hashedUserId = keccak256(abi.encodePacked(_userId));
        return userJournals[hashedUserId];
    }
}
