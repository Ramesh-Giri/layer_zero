// src/utils/options.ts

import { Options } from '@layerzerolabs/lz-v2-utilities';

export function createEnforcedOptions(): string {
    const _options = Options.newOptions().addExecutorLzReceiveOption(1000000, 1);
    return _options.toHex();
}
