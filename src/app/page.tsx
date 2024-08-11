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
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votedCandidateId, setVotedCandidateId] = useState<number | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [newCandidateName, setNewCandidateName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // ローディング状態を追加

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

        const voterId = await tempContract.voters(tempAccount);
        if (voterId > 0) {
          setVotedCandidateId(Number(voterId));
        }
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
      setLoading(true); // トランザクション送信後にローディングを有効化
      await tx.wait();
      setVotedCandidateId(candidateId);
      alert('投票に成功しました!');
    } catch (error) {
      console.error('投票に失敗しました:', error);
    } finally {
      setLoading(false); // トランザクション処理終了後にローディングを無効化
    }
  };

  const addNewCandidate = async () => {
    if (!contract || newCandidateName.trim() === '') return;

    try {
      const tx = await contract.addCandidate(newCandidateName);
      setLoading(true); // トランザクション送信後にローディングを有効化
      await tx.wait();
      alert(`${newCandidateName} を候補者として追加しました!`);

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

      setNewCandidateName(''); // 入力フィールドをリセット
    } catch (error) {
      console.error('候補者の追加に失敗しました:', error);
    } finally {
      setLoading(false); // トランザクション処理終了後にローディングを無効化
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center relative">
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
                  disabled={loading} // ローディング中はボタンを無効化
                >
                  投票
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              新しい候補者を追加
            </h3>
            <input
              type="text"
              value={newCandidateName}
              onChange={(e) => setNewCandidateName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="候補者名を入力"
              disabled={loading} // ローディング中は入力を無効化
            />
            <button
              onClick={addNewCandidate}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
              disabled={loading} // ローディング中はボタンを無効化
            >
              候補者を追加
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white mb-4"></div>
          <p className="text-white text-lg">トランザクション処理中...</p>
        </div>
      )}
    </div>
  );
}
