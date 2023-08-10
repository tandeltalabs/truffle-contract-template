const cloudbasePresaleContract = artifacts.require('CloudbasePresale');
const cloudContract = artifacts.require('Cloud');

module.exports = async function(deployer, network, accounts) {
    deployer.then(async () => {
        await deployer.deploy(cloudContract);
        await deployer.deploy(cloudbasePresaleContract, accounts[0], cloudContract.address);
        // more write contract deploy
    });
}
