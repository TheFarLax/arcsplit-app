// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArcSplit {
    struct Split {
        string name;
        address[] recipients;
        uint256[] percentages; // in basis points (e.g., 7000 = 70%)
        address creator;
        bool exists;
    }

    IERC20 public immutable usdc;
    mapping(uint256 => Split) public splits;
    uint256 public nextSplitId;

    event SplitCreated(uint256 indexed splitId, string name, address indexed creator);
    event FundsDistributed(uint256 indexed splitId, uint256 amount, address indexed payer);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function createSplit(string calldata name, address[] calldata recipients, uint256[] calldata percentages) external returns (uint256) {
        require(recipients.length == percentages.length, "Mismatched arrays");
        require(recipients.length > 0, "Empty split");

        uint256 total = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            total += percentages[i];
        }
        require(total == 10000, "Total percentage must be 100%");

        uint256 splitId = nextSplitId++;
        splits[splitId] = Split({
            name: name,
            recipients: recipients,
            percentages: percentages,
            creator: msg.sender,
            exists: true
        });

        emit SplitCreated(splitId, name, msg.sender);
        return splitId;
    }

    function payAndDistribute(uint256 splitId, uint256 amount) external {
        Split storage split = splits[splitId];
        require(split.exists, "Split does not exist");
        require(amount > 0, "Amount must be > 0");

        // Transfer USDC from payer to this contract first
        // Note: msg.sender must have approved this contract to spend USDC
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        for (uint256 i = 0; i < split.recipients.length; i++) {
            uint256 payout = (amount * split.percentages[i]) / 10000;
            if (payout > 0) {
                require(usdc.transfer(split.recipients[i], payout), "Payout failed");
            }
        }

        emit FundsDistributed(splitId, amount, msg.sender);
    }

    function getSplit(uint256 splitId) external view returns (
        string memory name, 
        address[] memory recipients, 
        uint256[] memory percentages, 
        address creator
    ) {
        Split storage split = splits[splitId];
        require(split.exists, "Split does not exist");
        return (split.name, split.recipients, split.percentages, split.creator);
    }
}
