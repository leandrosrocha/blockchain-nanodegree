/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

const SHA256 = require("crypto-js/sha256");
const BlockClass = require("./block.js");
const bitcoinMessage = require("bitcoinjs-message");

class Blockchain {
  /**
   * Constructor of the class, you will need to setup your chain array and the height
   * of your chain (the length of your chain array).
   * Also everytime you create a Blockchain class you will need to initialized the chain creating
   * the Genesis Block.
   * The methods in this class will always return a Promise to allow client applications or
   * other backends to call asynchronous functions.
   */
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  /**
   * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
   * You should use the `addBlock(block)` to create the Genesis Block
   * Passing as a data `{data: 'Genesis Block'}`
   */
  async initializeChain() {
    if (this.height === -1) {
      let block = new BlockClass.Block({
        data: "Genesis Block",
      });
      await this._addBlock(block);
    }
  }

  /**
   * Utility method that return a Promise that will resolve with the height of the chain
   */
  getChainHeight() {
    return new Promise((resolve, reject) => {
      resolve(this.height);
    });
  }

  /**
   * _addBlock(block) will store a block in the chain
   * @param {*} block
   * The method will return a Promise that will resolve with the block added
   * or reject if an error happen during the execution.
   * You will need to check for the height to assign the `previousBlockHash`,
   * assign the `timestamp` and the correct `height`...At the end you need to
   * create the `block hash` and push the block into the chain array. Don't for get
   * to update the `this.height`
   * Note: the symbol `_` in the method name indicates in the javascript convention
   * that this method is a private method.
   */
  _addBlock(block) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      console.log("addBLOCK");
      block.time = self.getCurrentTimestamp();
      block.height = self.chain.length;
      if (block.height > 0) {
        const previousBlock = self.getLatestBlock();
        block.previousBlockHash = previousBlock.hash;
      }
      block.hash = SHA256(JSON.stringify(block));
      self.height = block.height;
      self.chain.push(block);
      self.validateChain().then((errorLog) => {
        resolve(block);
      });
    });
  }

  /**
   * The requestMessageOwnershipVerification(address) method
   * will allow you  to request a message that you will use to
   * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
   * This is the first step before submit your Block.
   * The method return a Promise that will resolve with the message to be signed
   * @param {*} address
   */
  requestMessageOwnershipVerification(address) {
    let self = this;
    return new Promise((resolve) => {
      const timeStamp = self.getCurrentTimestamp();
      const message = address + ":" + timeStamp + ":" + "starRegistry";
      resolve(message);
    });
  }

  /**
   * The submitStar(address, message, signature, star) method
   * will allow users to register a new Block with the star object
   * into the chain. This method will resolve with the Block added or
   * reject with an error.
   * Algorithm steps:
   * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
   * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
   * 3. Check if the time elapsed is less than 5 minutes
   * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
   * 5. Create the block and add it to the chain
   * 6. Resolve with the block added.
   * @param {*} address
   * @param {*} message
   * @param {*} signature
   * @param {*} star
   */
  submitStar(address, message, signature, star) {
    let self = this;

    return new Promise(async (resolve, reject) => {
      //Get the time from the message sent as a parameter:
      const messageTime = parseInt(message.split(":")[1]);
      const currentTime = parseInt(self.getCurrentTimestamp());
      if (currentTime - messageTime < 5 * 60 * 1000) {
        bitcoinMessage.verify(message, address, signature);
        const block = new BlockClass.Block({ owner: address, star });
        self._addBlock(block).then((addedBlock) => {
          resolve(addedBlock);
        });
      } else {
        reject(new Error("Time elapsed is greater than 5 minutes"));
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block
   *  with the hash passed as a parameter.
   * Search on the chain array for the block that has the hash.
   * @param {*} hash
   */
  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve, reject) => {
      const block = self.chain.filter((block) => block.hash === hash)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  /**
   * This method will return a Promise that will resolve with the Block object
   * with the height equal to the parameter `height`
   * @param {*} height
   */
  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      let block = self.chain.filter((b) => b.height === height)[0];
      if (block) {
        block.validate().then((isValid) => {
          resolve(block);
        });
      } else {
        console.log("AAAAAAAAAAA");
        resolve(null);
      }
    });
  }

  // getLatest block method
  getLatestBlock() {
    if (!this.chain.length) return null;
    return this.chain[this.chain.length - 1];
  }

  getCurrentTimestamp() {
    return new Date().getTime().toString().slice(0, -3);
  }

  /**
   * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
   * and are belongs to the owner with the wallet address passed as parameter.
   * Remember the star should be returned decoded.
   * @param {*} address
   */
  getStarsByWalletAddress(address) {
    let self = this;
    let stars = [];
    return new Promise((resolve, reject) => {
      const blockDataPromises = self.chain.map((block) => {
        return block.getBData().then((blockData) => {
          if (!blockData) {
            return null;
          } else if (blockData.owner === address) {
            return blockData.star;
          }
        });
      });
      Promise.all(blockDataPromises).then((starArray) => {
        stars = starArray.filter((star) => star);
        if (stars.length > 0) {
          resolve(stars);
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * This method will return a Promise that will resolve with the list of errors when validating the chain.
   * Steps to validate:
   * 1. You should validate each block using `validateBlock`
   * 2. Each Block should check the with the previousBlockHash
   */
  validateChain() {
    let self = this;
    let errorLog = [];
    return new Promise(async (resolve, reject) => {
      const latestesHeight = self.chain.length - 1;
      console.log("HEIGHT", latestesHeight);
      for (let height = latestesHeight; height > 0; height--) {
        try {
          const block = await self.getBlockByHeight(height);
          console.log("BLOCK", block.height);
          const validBlock = await block.validate();
          console.log("TESTE 2");
          if (!validBlock) {
            errorLog.push(new Error(`Block ${block.height} is invalid!`));
          } else {
            const currentBlockPreviousHash = block.previousHash;
            if (currentBlockPreviousHash) {
              const previousBlock = await self.getBlockByHash(
                currentBlockPreviousHash
              );
              if (currentBlockPreviousHash !== previousBlock.hash) {
                errorLog.push(
                  new Error(
                    `Block ${block.height} has a previous block hash value that is different from the hash of the previous block`
                  )
                );
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
      if (!errorLog.length) {
        resolve(errorLog);
      } else {
        errorLog.forEach((error) => {
          console.log(error);
        });
        reject(errorLog).catch((error) => {
          console.log(error);
          throw error;
        });
      }
    });
  }
}

module.exports.Blockchain = Blockchain;
