const { ethers } = require("hardhat")

async function main() {
    // Replace this with your actual subscription ID from VRF.chain.link
    const SUBSCRIPTION_ID = "YOUR_SUBSCRIPTION_ID"
    
    console.log("Updating VRF subscription ID...")
    
    // Get the contract
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft")
    console.log("Contract address:", randomIpfsNft.address)
    
    // We need to deploy a new contract since the subscription ID is immutable
    console.log("\nDeploying new contract with correct subscription ID...")
    
    const RandomIpfsNft = await ethers.getContractFactory("RandomIpfsNft")
    
    // Get the current contract's parameters
    const mintFee = await randomIpfsNft.getMintFee()
    const dogUris = [
        await randomIpfsNft.getDogTokenUris(0),
        await randomIpfsNft.getDogTokenUris(1),
        await randomIpfsNft.getDogTokenUris(2)
    ]
    
    // Deploy new contract with correct subscription ID
    const newContract = await RandomIpfsNft.deploy(
        "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625", // Sepolia VRF Coordinator
        SUBSCRIPTION_ID,
        "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // Sepolia gas lane key hash
        mintFee,
        500000, // callback gas limit
        dogUris
    )
    
    await newContract.deployed()
    console.log("New contract deployed to:", newContract.address)
    console.log("\nPlease update your deployment files with the new contract address")
    console.log("Don't forget to add this new contract address as a consumer in your VRF subscription!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })