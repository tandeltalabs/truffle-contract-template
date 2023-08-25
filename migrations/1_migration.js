const cloudbasePresaleContract = artifacts.require('CloudbasePresale');
const cloudContract = artifacts.require('Cloud');
const owner = '0x288EdC0c61EB188CF6481b04a6fD66D74E027e43';
const cloud = '0xfE86E26F270a2286057Ed38D514Ce72dE806f298';


const { execSync } = require('node:child_process');

module.exports =  function (deployer, network, accounts) {
    deployer.then(async () => {
        if(network == 'develop'){
            await deployer.deploy(cloudContract);
            await deployer.deploy(cloudbasePresaleContract, accounts[0], cloudContract.address);
        } else {
            await deployer.deploy(cloudbasePresaleContract, owner, cloud);
            // more write contract deploy
            const verifyRs = execSync(`truffle run verify CloudbasePresale@${cloudbasePresaleContract.address} --network baseTestnet`);
            console.log(verifyRs.toString());
            console.log(cloudbasePresaleContract.address);
        }   
    });
}


