const { network, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts()
    console.log("\n=== NFT Contract Diagnostics ===\n")
    
    try {
        const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
        
        // Check contract state
        console.log("1. Basic Contract Info:")
        console.log("Contract address:", randomIpfsNft.address)
        const initialized = await randomIpfsNft.getInitialized()
        console.log("Initialized:", initialized)
        
        // Check VRF subscription
        console.log("\n2. VRF Configuration:")
        // We need to get these values from storage slots since they're private
        const subscriptionId = await randomIpfsNft.provider.getStorageAt(
            randomIpfsNft.address,
            "0x2" // storage slot for i_subscriptionId
        )
        console.log("Subscription ID:", parseInt(subscriptionId))
        
        // Check token URIs
        console.log("\n3. Token URIs:")
        try {
            for(let i = 0; i < 3; i++) {
                const uri = await randomIpfsNft.getDogTokenUris(i)
                console.log(`Dog ${i} URI:`, uri)
            }
        } catch (error) {
            console.log("Error fetching token URIs:", error.message)
        }
        
        // Check current token counter
        const tokenCounter = await randomIpfsNft.getTokenCounter()
        console.log("\n4. Current token counter:", tokenCounter.toString())
        
        // Check mint fee
        const mintFee = await randomIpfsNft.getMintFee()
        console.log("\n5. Mint fee:", ethers.utils.formatEther(mintFee), "ETH")
        
        // Check if the contract has LINK balance (for VRF)
        const linkToken = await ethers.getContractAt(
            "IERC20",
            "0x779877A7B0D9E8603169DdbD7836e478b4624789" // Sepolia LINK address
        )
        const linkBalance = await linkToken.balanceOf(randomIpfsNft.address)
        console.log("\n6. Contract LINK balance:", ethers.utils.formatEther(linkBalance), "LINK")

        // Verify VRF Coordinator
        console.log("\n7. VRF Coordinator check:")
        const vrfCoordinator = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625" // Sepolia VRF Coordinator
        const code = await ethers.provider.getCode(vrfCoordinator)
        console.log("VRF Coordinator has code:", code.length > 2)
        
        // Check if the caller has enough balance
        const callerBalance = await ethers.provider.getBalance(deployer)
        console.log("\n8. Caller balance:", ethers.utils.formatEther(callerBalance), "ETH")
        
    } catch (error) {
        console.error("\nError during diagnostics:", error)
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })