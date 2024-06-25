import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const EthereumContract: OmniPointHardhat = {
    eid: EndpointId.ETHEREUM_V2_MAINNET,
    contractName: 'WhaleOFT'
}

const BaseContract: OmniPointHardhat = {
    eid: EndpointId.BASE_MAINNET,
    contractName: 'WhaleOFT'
}


const config: OAppOmniGraphHardhat = {
    contracts: [
        {
            contract: EthereumContract,
        },
        
         {
            contract: BaseContract,
        }
    ],
    connections: [

        {
            from: EthereumContract,
            to: BaseContract,
        },
        {
            from: BaseContract,
            to: EthereumContract,
        }
    ],
}

export default config
