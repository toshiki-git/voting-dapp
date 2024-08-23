# Voting DApp

This repository is part of the labo rotation at [ICNL Lab](http://www.li-nlab.org/?page_id=156) at Kanazawa University. The goal is to create a decentralized voting application using Solidity. We’ll use Geth to set up a local blockchain and deploy smart contracts via Remix. Users can cast their votes through MetaMask.

## 1. Setup

### Required Software

- [Node.js](https://nodejs.org/) (Recommended Version: 18.x or higher)
- [Geth (Go Ethereum)](https://geth.ethereum.org/downloads/) (Version: 1.13.15 – This version is required)
- [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) (Chrome browser extension)

### Project Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/toshiki-git/voting-dapp.git
   cd voting-dapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## 2. Setting Up a Local Blockchain

1. Install Geth and initialize it with the following command:

   ```bash
   make init
   ```

2. Start the local node:

   ```bash
   make start
   ```

   This command will launch a Geth local node.

## 3. Compiling and Deploying the Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org/).
2. Create a file named `voting.sol` and write your smart contract code.
3. In the left pane, select "Solidity compiler" and compile the contract.
4. In the left pane, select "Deploy & Run Transactions" and set the environment to "Custom - External Http Provider."
5. Click the orange Deploy button to deploy the contract. Be sure to note the contract address that is generated after deployment.

## 4. Installing and Configuring MetaMask

### Installing MetaMask

1. Install the [MetaMask extension](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) in your browser.
2. Create a wallet and securely store your private key.

### Configuring MetaMask and Connecting to Geth

1. Open MetaMask, go to "Network" settings, and select "Add Network."
2. Set the Network Name to `Local`, the RPC URL to `http://127.0.0.1:8545`, the Chain ID to `15`, and the Currency Symbol to `ETH`. Then, click Save.
3. Create an account and import the same account you created in Geth.
4. Select the file from `/blockchain/keystore/`, enter the password (`password`), and complete the import.

## 5. Running the Web Application

1. Create a `.env.local` file in the root of the project and populate it with the following:

   ```bash
   cp .env.local.example .env.local
   ```

   Replace `<YOUR CONTRACT_ADDRESS>` with the smart contract address you noted earlier.

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` to verify that the DApp is working correctly.
