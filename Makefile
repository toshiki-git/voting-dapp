# Makefile for Geth Ethereum Client

# Specify data directory and password file
DATADIR=./blockchain
PASSWORD_FILE=$(DATADIR)/password.txt
GENESIS_FILE=$(DATADIR)/genesis.json
ETHERBASE=0x2c06ffdb26befc55472267ec4b9b1dd35c046a76

# Network ID and HTTP settings
NETWORKID=15
HTTP_ADDRESS=http://127.0.0.1:8545

# Initialization of the blockchain
init:
	geth init --datadir $(DATADIR) $(GENESIS_FILE)

# Start
start:
	geth --datadir $(DATADIR) --networkid $(NETWORKID) --http --http.corsdomain="*" --http.api "web3,eth,debug,personal,net,miner" --allow-insecure-unlock --unlock 0,1,2,3,4,5 --password $(PASSWORD_FILE) --nodiscover --miner.etherbase $(ETHERBASE) --mine --vmdebug

# Attach to the console
attach:
	geth attach $(HTTP_ADDRESS)
