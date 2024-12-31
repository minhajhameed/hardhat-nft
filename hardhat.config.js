require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Your etherscan API key"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            subscriptionId: "41456591562868419939207461511904602145412134598423276310034478986806274376033",
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    solidity: {
        compilers: [
            {
                version: "0.8.28",
            },
            {
                version: "0.8.8",
            },
            {
                version: "0.6.6",
            },
            {
                version: "0.6.0",
            }
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
}
