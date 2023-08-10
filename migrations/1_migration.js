const templateContract = artifacts.require('Template');

module.exports = async function(deployer, network, accounts) {
    deployer.then(async () => {
        await deployer.deploy(templateContract);
        // more write contract deploy
    });
}
