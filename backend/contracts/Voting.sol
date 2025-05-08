// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./ERC20.sol";

contract Voting {
    uint public amountRequired;
    string public proposalTitle;
    ERC20 public token;
    address public owner;
    uint public voteCount;
    uint public firstOptVotes;
    uint public secondOptVotes;
    uint public thirdOptVotes;
    uint public fourthOptVotes;

    struct Options {
        string firstOption;
        string secondOption;
        string thirdOption;
        string fourthOption;
    }

    Options public options;
    mapping(address => bool) public isVoted;
    mapping(address => string) public votedOption;
    address[] public voters;

    event Voted(address indexed voter, string option);
    event ProposalCreated(string title);

    constructor(uint _amountRequired, address _tokenAddress) {
        amountRequired = _amountRequired;
        token = ERC20(_tokenAddress);
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    function createProposal(
        string memory _proposalTitle,
        string memory _firstOpt,
        string memory _secondOpt,
        string memory _thirdOpt,
        string memory _fourthOpt
    ) public onlyOwner {
        proposalTitle = _proposalTitle;
        options = Options(_firstOpt, _secondOpt, _thirdOpt, _fourthOpt);

        for (uint i = 0; i < voters.length; i++) {
            address voter = voters[i];
            isVoted[voter] = false;
            votedOption[voter] = "";
        }
        emit ProposalCreated(_proposalTitle);
        delete voters;

        firstOptVotes = 0;
        secondOptVotes = 0;
        thirdOptVotes = 0;
        fourthOptVotes = 0;

        voteCount = 0;
    }

    function vote(string memory _votedOption) public {
        require(
            keccak256(bytes(_votedOption)) ==
                keccak256(bytes(options.firstOption)) ||
                keccak256(bytes(_votedOption)) ==
                keccak256(bytes(options.secondOption)) ||
                keccak256(bytes(_votedOption)) ==
                keccak256(bytes(options.thirdOption)) ||
                keccak256(bytes(_votedOption)) ==
                keccak256(bytes(options.fourthOption)),
            "Invalid Voting option"
        );
        require(!isVoted[msg.sender], "Already voted");
        require(
            token.balanceOf(msg.sender) >= amountRequired,
            "Not enough tokens to vote"
        );
        votedOption[msg.sender] = _votedOption;

        isVoted[msg.sender] = true;
        voters.push(msg.sender);
        voteCount++;
        emit Voted(msg.sender, _votedOption);

        // Count vote for each options
        if (
            keccak256(bytes(_votedOption)) ==
            keccak256(bytes(options.firstOption))
        ) {
            firstOptVotes++;
        } else if (
            keccak256(bytes(_votedOption)) ==
            keccak256(bytes(options.secondOption))
        ) {
            secondOptVotes++;
        } else if (
            keccak256(bytes(_votedOption)) ==
            keccak256(bytes(options.thirdOption))
        ) {
            thirdOptVotes++;
        } else if (
            keccak256(bytes(_votedOption)) ==
            keccak256(bytes(options.fourthOption))
        ) {
            fourthOptVotes++;
        }

        // Optional: deduct tokens if you want
        // token.transferFrom(msg.sender, address(this), amountRequired);
    }

    function getProposal()
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            string memory
        )
    {
        return (
            proposalTitle,
            options.firstOption,
            options.secondOption,
            options.thirdOption,
            options.fourthOption
        );
    }

    function getWinner()
        public
        view
        returns (string memory winner, uint count)
    {
        winner = options.firstOption;
        count = firstOptVotes;

        if (secondOptVotes > count) {
            winner = options.secondOption;
            count = secondOptVotes;
        }
        if (thirdOptVotes > count) {
            winner = options.thirdOption;
            count = thirdOptVotes;
        }
        if (fourthOptVotes > count) {
            winner = options.fourthOption;
            count = fourthOptVotes;
        }
    }
}
