import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'WhaleOFT'
}

const baseTestContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'WhaleOFT'
}


const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: sepoliaContract,
        },
        
         {
            contract: baseTestContract,
        }
    ],
    connections: [

        {
            from: sepoliaContract,
            to: baseTestContract,
        },
        {
            from: baseTestContract,
            to: sepoliaContract,
        }
    ],
}

export default config
