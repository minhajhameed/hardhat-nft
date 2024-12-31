const { network, ethers } = require("hardhat")

module.exports = async ({ getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    console.log(`Deploying to network: ${network.name} (chainId: ${chainId})`)
    console.log(`Using deployer address: ${deployer}`)

    try {
        // Random IPFS NFT
        console.log("Getting RandomIpfsNft contract...")
        const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
        console.log("Contract address:", randomIpfsNft.address)

        // Check if contract is properly initialized
        console.log("Checking contract initialization...")
        const initialized = await randomIpfsNft.getInitialized()
        if (!initialized) {
            throw new Error("Contract not initialized")
        }

        // Get and verify mint fee
        console.log("Getting mint fee...")
        const mintFee = await randomIpfsNft.getMintFee()
        console.log(`Mint fee: ${ethers.utils.formatEther(mintFee)} ETH`)

        // Check deployer balance
        const balance = await ethers.provider.getBalance(deployer)
        console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`)

        if (balance.lt(mintFee)) {
            throw new Error("Insufficient balance for minting")
        }

        console.log("Requesting NFT mint...")
        const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
            value: mintFee,
            gasLimit: 500000
        })
        
        console.log("Waiting for transaction confirmation...")
        const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
        console.log("Mint transaction confirmed:", randomIpfsNftMintTxReceipt.transactionHash)

        // For Sepolia, we need to wait for the VRF response
        console.log("Waiting for VRF response and NFT minting (this may take several minutes)...")
        
        await new Promise(async (resolve, reject) => {
            // Set timeout to 10 minutes for Sepolia
            setTimeout(() => reject("Timeout: 'NFTMinted' event did not fire"), 600000)

            randomIpfsNft.once("NftRequested", async (requestId, requester) => {
                console.log(`NFT Requested - RequestId: ${requestId}, Requester: ${requester}`)
            })

            randomIpfsNft.once("NftMinted", async (tokenId, breed, minter) => {
                try {
                    console.log(`NFT Minted - TokenId: ${tokenId}, Breed: ${breed}, Minter: ${minter}`)
                    const tokenURI = await randomIpfsNft.tokenURI(tokenId)
                    console.log(`Token URI for token ${tokenId}: ${tokenURI}`)
                    resolve()
                } catch (error) {
                    console.error("Error getting token URI:", error)
                    reject(error)
                }
            })

            // For local testing only
            if (chainId == 31337) {
                console.log('Local network detected, fulfilling random words...')
                const requestId = randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
                const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
                await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNft.address)
            }
        })

    } catch (error) {
        console.error('Error during deployment:', error)
        throw error
    }
}

module.exports.tags = ["all", "mint"]