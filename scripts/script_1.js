module.exports = async function main(callback) {
    try {
        const  CloudbasePresale = artifacts.require('CloudbasePresale');
        const cloudbasePresale = await CloudbasePresale.deployed();

        const whiteLists = ['0x11a06d39524947ff4d42ec2346f5dC25Fda4aAAE','0x3D8c239F98A3c3fFacC9608edd5cf7923fdff3b7','0xDC5B3b38381A1A08211daac05fC29Ee27d2a6C24','0x9e5CeDE2d296E1b8f437804cBF34Bb7eAfBd11f2','0xD495F864b7A9De801B08B81c080214d0bC25dD2F'];

        await cloudbasePresale.setWhitelist(whiteLists);

        const startTime = 1691650200;
        const endTime = startTime + 65*60;

        // set time buy 
        await cloudbasePresale.setBuyTime(startTime, endTime);

        let initTime = 1691654700;
        const timeVests = [initTime,initTime+3*60,initTime+6*60];
        const percentVests = [50,25,25];
        // set vest time
        await cloudbasePresale.setClaimTime(timeVests, percentVests);

        callback()
    } catch (error) {
        console.log(error);
    }
}