// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Voting {
    // Candidate struct to hold candidate details
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    // Voter struct to hold voter details
    struct Voter {
        bool authorized;
        bool voted;
        uint vote;
    }
    // State variables
    address public owner;
    string public electionName;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;
    uint public totalVotes;
    // Event to announce election results
    event ElectionResult(string name, uint voteCount);
    // Modifier to restrict access to owner only
    modifier ownerOnly() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    // Constructor to initialize the contract with an election name
    constructor(string memory _name) {
        owner = msg.sender;
        electionName = _name;
    }
    // Function to add a new candidate
    function addCandidate(string memory _name) public ownerOnly {
        candidates.push(Candidate(candidates.length, _name, 0));
    }
    // Function to authorize a voter
    function authorize(address _person) public ownerOnly {
        voters[_person].authorized = true;
    }
    // Function for voting
    function vote(uint _candidateId) public {
        require(voters[msg.sender].authorized, "Not authorized to vote");
        require(!voters[msg.sender].voted, "Already voted");
        require(_candidateId < candidates.length, "Invalid candidate ID");
        voters[msg.sender].vote = _candidateId;
        voters[msg.sender].voted = true;
        candidates[_candidateId].voteCount += 1;
        totalVotes += 1;
    }
    // Function to end the election and announce results
    function end() public ownerOnly {
        for (uint i = 0; i < candidates.length; i++) {
            emit ElectionResult(candidates[i].name, candidates[i].voteCount);
        }
    }
    // Function to get the number of candidates
    function getNumCandidates() public view returns (uint) {
        return candidates.length;
    }
}