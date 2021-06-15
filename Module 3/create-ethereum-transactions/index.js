/*##########################

CONFIGURATION
##########################*/

// -- Step 1: Set up the appropriate configuration
var Web3 = require("web3");
var EthereumTransaction = require("ethereumjs-tx").Transaction;
var web3 = new Web3("HTTP://127.0.0.1:7545");

// -- Step 2: Set the sending and receiving addresses for the transaction.
var sendingAddress = "0xb0Cf05551a62D4a0b3beEABc7DBf480DfC73Fc70";
var receivingAddress = "0x62Ed71346a6fce155821C7701788aAa4A7D26832";

// -- Step 3: Check the balances of each address
web3.eth.getBalance(sendingAddress).then(console.log);
web3.eth.getBalance(receivingAddress).then(console.log);

/*##########################

CREATE A TRANSACTION
##########################*/

// -- Step 4: Set up the transaction using the transaction variables as shown
var rawTransaction = {
  nonce: 1,
  to: receivingAddress,
  gasPrice: 20000000,
  gasLimit: 30000,
  value: 2000000000000000000,
  data: null,
};

/*##########################

Sign the Transaction
##########################*/

// -- Step 7: Sign the transaction with the Hex value of the private key of the sender
var privateKeySender =
  "eddf0a019e1db13b684d8607fadbae44f54a6f32841a57403d15ce1ad82fe2c5";
var privateKeySenderHex = Buffer.from(privateKeySender, "hex");
var transaction = new EthereumTransaction(rawTransaction);
transaction.sign(privateKeySenderHex);

/*#########################################

Send the transaction to the network
#########################################*/

// -- Step 8: Send the serialized signed transaction to the Ethereum network.
var serializedTransaction = transaction.serialize();
web3.eth.sendSignedTransaction(serializedTransaction);
