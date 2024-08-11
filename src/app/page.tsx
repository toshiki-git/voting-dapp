'use client';
import VotingABI from './abi.json';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

// Get the contract address from the environment variables
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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voted, setVoted] = useState<boolean>(false);
  const [account, setAccount] = useState<string | null>(null);

  useEffect(() => {
    const initEthers = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        await tempProvider.send('eth_requestAccounts', []);
        const tempSigner = await tempProvider.getSigner();
        const tempAccount = await (await tempSigner).getAddress();

        const tempContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VotingABI,
          tempSigner
        );

        setProvider(tempProvider);
        setSigner(tempSigner);
        setAccount(tempAccount);
        setContract(tempContract);

        const candidatesCount: number = await tempContract.candidatesCount();
        const tempCandidates: Candidate[] = [];
        for (let i = 1; i <= candidatesCount; i++) {
          const [name, voteCount] = await tempContract.getCandidate(i);
          tempCandidates.push({ id: i, name, voteCount: voteCount.toString() });
        }
        setCandidates(tempCandidates);
      } else {
        console.error('MetaMaskがインストールされていません。');
      }
    };

    initEthers();
  }, []);

  const voteForCandidate = async (candidateId: number) => {
    if (!contract) return;

    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();
      setVoted(true);
      alert('投票に成功しました!');
    } catch (error) {
      console.error('投票に失敗しました:', error);
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
            接続中のアカウント: {account}
          </p>
        ) : (
          <p className="text-sm text-center text-red-600 mb-4">
            MetaMaskを接続してください。
          </p>
        )}
        {voted ? (
          <p className="text-xl font-semibold text-green-500 text-center">
            投票ありがとうございます！
          </p>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              候補者一覧
            </h2>
            <ul className="space-y-4">
              {candidates.map((candidate) => (
                <li
                  key={candidate.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg"
                >
                  <span className="text-lg font-medium text-gray-700">
                    {candidate.name} - {candidate.voteCount}票
                  </span>
                  <button
                    onClick={() => voteForCandidate(candidate.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    投票
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
