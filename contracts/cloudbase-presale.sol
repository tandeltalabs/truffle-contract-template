// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CloudbasePresale is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for ERC20;

    // Wallet
    address public idoOwner;
    mapping(address => bool) public whitelistMap;
    mapping(address => uint256) public paidIdoMap;
    mapping(address => uint256) public vestingMap;
    mapping(address => uint256) public vestingAmountMap;

    // General
    bool public isPause;

    uint256 public price = 68350000000000; // 0.0125 = x80
    uint256 public minBuy = 3417500000000000; // 0.001
    uint256 public maxBuy = 34175000000000000; // 150
    uint256 public maxAllocation = 2563125000000000000; // CORE
    uint256 public totalOfPaid; // User paid
    uint256 public totalOfUserWhitelist;

    // Token
    ERC20 public coredogeToken; // $CDC

    // Time
    // Buy: Stake USDT
    uint256 public startBuyTime = 1691634600;
    uint256 public endBuyTime = 1691635500;

    // Struct
    // Vesting
    struct StageIdo {
        uint256 id;
        uint256 percent;
        uint256 startTime;
    }

    StageIdo[] public stageList; // 3 times vesting


    // Event
    event EventUserBuy(address user, uint256 amount, uint256 time);
    event EventUserClaim(address user, uint256 amount, uint256 time);

    constructor(
        address _idoOwner,
        address _coredogeToken
    ) {
        idoOwner = _idoOwner;
        coredogeToken = ERC20(_coredogeToken);

        isPause = false; // Mark pause if deploy
    }

    // Modifier
    modifier validBuyTime() {
        require(startBuyTime < block.timestamp, "Time buy invalid");
        require(block.timestamp < endBuyTime, "Time buy invalid");
        _;
    }

    modifier isRun() {
        require(isPause == false, "Contract is paused");
        _;
    }

    function setPause(bool _status) public onlyOwner {
        isPause = _status;
    }

    // Using TimeStamp
    function setBuyTime(uint256 _startBuyTime, uint256 _endBuyTime) public onlyOwner {
        require(_startBuyTime < _endBuyTime, "Input time buy invalid");

        startBuyTime = _startBuyTime;
        endBuyTime = _endBuyTime;
    }

    function setClaimTime(uint256[] calldata _startTimeList, uint256[] calldata _percentList) public onlyOwner {
        require(_startTimeList.length > 0, "Input stage invalid");
        require(_startTimeList.length == _percentList.length, "Input stage invalid");

        delete stageList;

        for (uint256 index = 0; index < _startTimeList.length; index++) {
            StageIdo memory stageObject;
            stageObject.id = index;
            stageObject.startTime = _startTimeList[index];
            stageObject.percent = _percentList[index];

            stageList.push(stageObject);
        }

    }

    function setIdoOwner(address _idoOwner) public onlyOwner {
        idoOwner = _idoOwner;
    }

    function setTotalOfSlot(uint256 _maxAllocation) public onlyOwner {
        maxAllocation = _maxAllocation;
    }

    function setIdoConfig(
            uint256 _startBuyTime,
            uint256 _endBuyTime

        ) public onlyOwner {
        
        startBuyTime = _startBuyTime;
        endBuyTime = _endBuyTime;
    }

    // Set whitelist
    function setWhitelist(address[] calldata userList) public onlyOwner {
        for (uint256 index = 0; index < userList.length; index++) {
            whitelistMap[userList[index]] = true;
            totalOfUserWhitelist++;
        }
    }

    function removeWhitelist(address[] calldata userList) public onlyOwner {
        for (uint256 index = 0; index < userList.length; index++) {
            if (whitelistMap[userList[index]]) {
                whitelistMap[userList[index]] = false;
                if (totalOfUserWhitelist > 0) {
                    totalOfUserWhitelist--;
                }

            }
        }
    }

    function buyPresale() public validBuyTime nonReentrant isRun payable {
        uint256 _amount = msg.value;
        uint256 currentPaid = paidIdoMap[msg.sender];
        require(_amount > 0, "Amount must be greater than zero");
        require(whitelistMap[msg.sender] == true, "You are not in whitelist");
        require(totalOfPaid + _amount <= maxAllocation, "Full buy slot");
        require(currentPaid + _amount <= maxBuy, "Max buy error");
        require(_amount >= minBuy, "Min buy is invalid");
        require(_amount <= maxBuy, "Max buy is invalid");

        paidIdoMap[msg.sender] = currentPaid.add(_amount);
        vestingMap[msg.sender] = 0;
        totalOfPaid = totalOfPaid.add(_amount);

        emit EventUserBuy(msg.sender, _amount, block.timestamp);
    }

    function claimPresale() public nonReentrant isRun {
        require(whitelistMap[msg.sender] == true, "You are not whitelist before");
        require(paidIdoMap[msg.sender] > 0, "You are not paid before");
        uint256 currentIndexVesting = vestingMap[msg.sender];
        
        StageIdo memory stageObject = stageList[currentIndexVesting];
        uint256 currentPercentVesting = stageObject.percent;
        uint256 currentTimeVesting = stageObject.startTime;

        require(currentIndexVesting < stageList.length, "Claim index is invalid");
        require(currentPercentVesting > 0, "Percent vesting is invalid");
        require(currentTimeVesting < block.timestamp, "Claim time is not started");

        vestingMap[msg.sender] = currentIndexVesting + 1;

        // Actual received = amount purchase * price
        uint256 tokenPaid = paidIdoMap[msg.sender].mul(1 ether).div(price);
        uint256 amountClaim = currentPercentVesting.mul(tokenPaid).div(100);
        
        vestingAmountMap[msg.sender] += amountClaim;
        coredogeToken.safeTransfer(msg.sender, amountClaim);

        emit EventUserClaim(msg.sender, amountClaim, block.timestamp);
    }

    function nextStageIndex(address _account) public view returns (uint256) {
        return vestingMap[_account];
    }

    //Withdraw all $CDC token from contract to idoOwner
    function urgentWithdrawAllToken() public onlyOwner {
        uint256 balance = coredogeToken.balanceOf(address(this));
        if (balance > 0) {
            coredogeToken.safeTransfer(idoOwner, balance);
        }
    }

    function withdrawETH() public onlyOwner {
        payable(idoOwner).transfer(address(this).balance);
    }
}