'use client';
import VotingABI from './abi.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;

if (CONTRACT_ADDRESS === undefined) {
  throw new Error('CONTRACT_ADDRESS is not set in the environment variables.');
}

interface Candidate {
  id: number;
  name: string;
  voteCount: string;
}

export default function Home() {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [newCandidateName, setNewCandidateName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const initEthers = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        await tempProvider.send('eth_requestAccounts', []);
        const tempSigner = await tempProvider.getSigner();
        const tempAccount = await tempSigner.getAddress();

        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VotingABI,
          tempSigner
        );

        setAccount(tempAccount);
        setContract(tempContract);

        loadCandidates(tempContract);
      } else {
        console.error('MetaMask is not installed.');
      }
    };

    initEthers();
  }, []);

  const loadCandidates = async (contract: ethers.Contract) => {
    try {
      const candidatesCount: number = await contract.candidatesCount();
      const candidatesArray: Candidate[] = [];

      for (let i = 1; i <= candidatesCount; i++) {
        const [name, voteCount] = await contract.getCandidate(i);
        candidatesArray.push({
          id: i,
          name,
          voteCount: voteCount.toString(),
        });
      }

      setCandidates(candidatesArray);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    }
  };

  const voteForCandidate = async (candidateId: number) => {
    if (!contract) return;

    try {
      const tx = await contract.vote(candidateId);
      setLoading(true);
      await tx.wait();
      alert('Successfully voted!');
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNewCandidate = async () => {
    if (!contract || newCandidateName.trim() === '') return;

    try {
      const tx = await contract.addCandidate(newCandidateName);
      setLoading(true);
      await tx.wait();
      alert(`${newCandidateName} has been added as a candidate!`);

      const candidatesCount: number = await contract.candidatesCount();
      const newCandidate = await contract.getCandidate(candidatesCount);
      setCandidates([
        ...candidates,
        {
          id: candidatesCount,
          name: newCandidate[0],
          voteCount: newCandidate[1].toString(),
        },
      ]);

      setNewCandidateName('');
    } catch (error) {
      console.error('Failed to add candidate:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Voting DApp
        </h1>
        {account ? (
          <p className="text-sm text-center text-gray-600 mb-4">
            Connected account: {account}
          </p>
        ) : (
          <p className="text-sm text-center text-red-600 mb-4">
            Please connect MetaMask.
          </p>
        )}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Candidate List
          </h2>
          <ul className="space-y-4">
            {candidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg"
              >
                <span className="text-lg font-medium text-gray-700">
                  {candidate.name} - {candidate.voteCount} votes
                </span>
                <button
                  onClick={() => voteForCandidate(candidate.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  disabled={loading}
                >
                  Vote
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Add New Candidate
            </h3>
            <input
              type="text"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Enter candidate name"
              disabled={loading}
            />
            <button
              onClick={addNewCandidate}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
              disabled={loading}
            >
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4"></div>
          <p className="text-white text-lg">Processing transaction...</p>
        </div>
      )}
    </div>
  );
}
