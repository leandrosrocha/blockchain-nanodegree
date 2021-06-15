var Web3 = require("web3");

var url = "HTTP://127.0.0.1:7545"; // 8545 if using ganache-cli

var web3 = new Web3(url);

web3.eth
  .getTransactionCount("0xb0Cf05551a62D4a0b3beEABc7DBf480DfC73Fc70")
  .then(console.log);
