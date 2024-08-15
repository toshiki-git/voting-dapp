// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    mapping(uint => Candidate) public candidates;
    mapping(address => uint) public voters; // Voter address maps to the candidateId they voted for
    uint public candidatesCount;
    event Voted(uint indexed candidateId);
    event CandidateAdded(uint indexed candidateId, string name);
    constructor() {
        addCandidate("Alice");
        addCandidate("Bob");
        addCandidate("Charlie");
    }
    function addCandidate(string memory name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
        emit CandidateAdded(candidatesCount, name);
    }
    function vote(uint candidateId) public {
        require(candidateId > 0 && candidateId <= candidatesCount, "Invalid candidate ID.");
        // If the voter has already voted, subtract their vote from the previous candidate
        uint previousVote = voters[msg.sender];
        if (previousVote != 0) {
            candidates[previousVote].voteCount--;
        }
        // Update with the new vote
        voters[msg.sender] = candidateId;
        candidates[candidateId].voteCount++;
        emit Voted(candidateId);
    }
    function getCandidate(uint candidateId) public view returns (string memory, uint) {
        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount);
    }
}