import CyberConnectSDK, {
  Blockchain,
  Env,
} from '@cyberlab/cyberconnect';

let cyberConnectSDK: CyberConnectSDK | undefined;

/**
 * @param provider you can get provider from @solana/wallet-adapter-react
 * @see https://github.com/cyberconnecthq/js-cyberconnect/tree/30b2ae0a78a5768431328a6f54fdb614709ea925#solana
 */
export function getCyberConnectSDK(provider: any): CyberConnectSDK {
  if (!cyberConnectSDK) {
    cyberConnectSDK = new CyberConnectSDK({
      namespace: 'CyberConnect',
      env: Env.PRODUCTION,
      chain: Blockchain.SOLANA,
      provider: provider,
      chainRef: '',
    })
  }

  return cyberConnectSDK;
}
