const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract("StarNotary", (accs) => {
  accounts = accs;
  owner = accounts[0];
});

it("can Create a Star", async () => {
  let tokenId = 1;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  assert.equal(await instance.tokenIdToStarInfo.call(tokenId), "Awesome Star!");
});

it("lets user1 put up their star for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let starId = 2;
  let starPrice = web3.utils.toWei(".01", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it("lets user1 get the funds after the sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 3;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
  await instance.buyStar(starId, { from: user2, value: balance });
  let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
  let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
  let value2 = Number(balanceOfUser1AfterTransaction);
  assert.equal(value1, value2);
});

it("lets user2 buy a star, if it is put up for sale", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 4;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance });
  assert.equal(await instance.ownerOf.call(starId), user2);
});

it("lets user2 buy a star and decreases its balance in ether", async () => {
  let instance = await StarNotary.deployed();
  let user1 = accounts[1];
  let user2 = accounts[2];
  let starId = 5;
  let starPrice = web3.utils.toWei(".01", "ether");
  let balance = web3.utils.toWei(".05", "ether");
  await instance.createStar("awesome star", starId, { from: user1 });
  await instance.putStarUpForSale(starId, starPrice, { from: user1 });
  let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
  const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
  await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
  const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
  let value =
    Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
  assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it("can add the token name and symbol properly", async () => {
  let instance = await StarNotary.deployed();
  const tokenName = "Star Notary Token";
  const tokenSymbol = "SNT";
  assert.equal(tokenName, await instance.name());
  assert.equal(tokenSymbol, await instance.symbol());
});

it("lookUptokenIdToStarInfo test", async () => {
  // 1. create a Star with different tokenId
  let tokenId = 6;
  let instance = await StarNotary.deployed();
  await instance.createStar("Awesome Star!", tokenId, { from: accounts[0] });
  // 2. Call your method lookUptokenIdToStarInfo
  // 3. Verify if you Star name is the same
  assert.equal(
    await instance.lookUptokenIdToStarInfo.call(tokenId),
    "Awesome Star!"
  );
});

it("lets 2 users exchange stars", async () => {
  // 1. create 2 Stars with different tokenId
  const instance = await StarNotary.deployed();
  const Star1TokenId = 7;
  const Star1Name = "Star 1";
  const owner1 = accounts[0];
  const Star2TokenId = 8;
  const Star2Name = "Star 2";
  const owner2 = accounts[1];

  await instance.createStar(Star1Name, Star1TokenId, { from: owner1 });
  await instance.createStar(Star2Name, Star2TokenId, { from: owner2 });
  // 2. Call the exchangeStars functions implemented in the Smart Contract
  await instance.exchangeStars(Star1TokenId, Star2TokenId, { from: owner1 });
  // 3. Verify that the owners changed
  assert.equal(await instance.ownerOf.call(Star1TokenId), owner2);
  assert.equal(await instance.ownerOf.call(Star2TokenId), owner1);
});

it("lets a user transfer a star", async () => {
  // 1. create a Star with different tokenId
  let instance = await StarNotary.deployed();
  const tokenId = 9;
  const owner1 = accounts[0];
  const owner2 = accounts[1];
  await instance.createStar("Star name", tokenId, { from: owner1 });
  // 2. use the transferStar function implemented in the Smart Contract
  await instance.transferStar(owner2, tokenId);

  // 3. Verify the star owner changed.
  assert.equal(await instance.ownerOf.call(tokenId), owner2);
});
