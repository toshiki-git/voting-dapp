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
    event VotingEnded(string winnerName, uint winnerVoteCount);

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

    function endVoting() public returns (string memory winnerName, uint winnerVoteCount) {
        require(candidatesCount > 0, "No candidates available.");

        // Determine the candidate with the highest vote count
        uint highestVoteCount = 0;
        uint winnerId = 0;
        for (uint i = 1; i <= candidatesCount; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winnerId = i;
            }
        }

        // Get winner information
        winnerName = candidates[winnerId].name;
        winnerVoteCount = candidates[winnerId].voteCount;

        // Emit the VotingEnded event with the winner's information
        emit VotingEnded(winnerName, winnerVoteCount);

        // Clear the candidates and reset the candidatesCount for a new voting round
        for (uint i = 1; i <= candidatesCount; i++) {
            delete candidates[i];
        }
        candidatesCount = 0;

        // Clear voter records
        for (uint i = 0; i < candidatesCount; i++) {
            voters[msg.sender] = 0;
        }

        return (winnerName, winnerVoteCount);
    }

    function getCandidate(uint candidateId) public view returns (string memory, uint) {
        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount);
    }
}
