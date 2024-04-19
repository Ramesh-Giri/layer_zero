import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const sepoliaContract: OmniPointHardhat = {
    eid: EndpointId.SEPOLIA_V2_TESTNET,
    contractName: 'ApuOFT'
}

const baseSepoliacContract: OmniPointHardhat = {
    eid: EndpointId.BASESEP_V2_TESTNET,
    contractName: 'ApuOFT'
}


const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: sepoliaContract,
        },
        {
            contract: baseSepoliacContract,
        }
    ],
    connections: [

        {
            from: sepoliaContract,
            to: baseSepoliacContract,
        },
        {
            from: baseSepoliacContract,
            to: sepoliaContract,
        }
    ],
}

export default config
