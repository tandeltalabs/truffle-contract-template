function getTimestamp(DateString) {
    return Math.floor(new Date(DateString).getTime()/1000);
}

module.exports = async function main(callback) {
    try {
        const  CloudbasePresale = artifacts.require('CloudbasePresale');
        const cloudbasePresale = await CloudbasePresale.deployed();
        const rawWhiteList = 
        `0x11a06d39524947ff4d42ec2346f5dC25Fda4aAAE
0xbb578F5ACce073f81F0Acf27843da27fb21D78a6
0xDC5B3b38381A1A08211daac05fC29Ee27d2a6C24
0x9e5CeDE2d296E1b8f437804cBF34Bb7eAfBd11f2
0xD495F864b7A9De801B08B81c080214d0bC25dD2F
0x1CCE7d0D87b47834F5AE793ADf7d2727eb054746
0x9BB3568f2FF5a382D06126F464c90012afa4AD58
0x2Dd9708bEC13d054525A9a76D325C36cE7De3895
0x730Ca6Bb70B993F4fbB53A108C0902a9fc6dbE86`;
        const whiteLists = rawWhiteList.split('\n');

        await cloudbasePresale.setWhitelist(whiteLists);

        const startTime = getTimestamp('Fri August 11, 2023 11:30:00');
        const endTime = startTime + 20*60;

        // set time buy 
        await cloudbasePresale.setBuyTime(startTime, endTime);

        let initTime = endTime + 1*60;
        const timeVests = [initTime,initTime+3*60,initTime+6*60];
        const percentVests = [50,25,25];
        // set vest time
        await cloudbasePresale.setClaimTime(timeVests, percentVests);

        callback()
    } catch (error) {
        console.log(error);
    }
}