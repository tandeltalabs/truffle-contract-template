const TemplateContract = artifacts.require("CloudbasePresale");
const CloudContract = artifacts.require("Cloud");
const { time } = require("@openzeppelin/test-helpers");

function convertToWei(_ether) {
    return _ether.toString().concat('000000000000000000');
} 

contract("CloudbasePresale", (accounts) => {
    const owner = accounts[0];
    const buyer1 = accounts[1];
    const buyer2 = accounts[2];
    const buyer3 = accounts[3];
   
    let templateContract;
    let cloudContract;
    let now;
    
    before(async () => {
        templateContract = await TemplateContract.deployed();
        cloudContract = await CloudContract.deployed();
        now = (await web3.eth.getBlock("latest")).timestamp;
    })

    it("config contract", async () => {
        const startTime = now;
        const endTime = now + 10000;
        const timeVests = [now + 10000, now + 20000, now + 30000];
        const percentVests = [50,25,25];
       
        // set whitelist
        await templateContract.setWhitelist([buyer1,buyer2,buyer3]);

        // set time buy
        await templateContract.setBuyTime(startTime, endTime);

        // set vest time
        await templateContract.setClaimTime(timeVests, percentVests);

        await cloudContract.mint(templateContract.address, convertToWei(800));
    });
    
    it("Buy", async () => {
        await time.increase(1);
        await templateContract.buyPresale({from: buyer1, value: '54680000000000000'});
        // await templateContract.buyPresale();
        // await templateContract.buyPresale();
        const amountPaid = await templateContract.paidIdoMap.call(buyer1);
        assert.equal(amountPaid.toString(), '54680000000000000', "claim token incorrect");
        // wite test code
    });

    it("Vest", async () => {
        await time.increase(now + 10000);
        await templateContract.claimPresale({from: buyer1});

        await time.increase(now + 20000);
        await templateContract.claimPresale({from: buyer1});

        await time.increase(now + 30000);
        await templateContract.claimPresale({from: buyer1});

        const balance = await cloudContract.balanceOf(buyer1);

        assert.equal(balance.toString(), convertToWei(800), "claim token incorrect");
        // wite test code
    });

    it("Withdraw", async () => {
        const balanceBefore = await web3.utils.toBN(await web3.eth.getBalance(owner));
        console.log(balanceBefore.toString());
        await templateContract.withdrawETH();
        const balance = await web3.utils.toBN(await web3.eth.getBalance(owner));
        console.log(balance.toString());
    });
});
