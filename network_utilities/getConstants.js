import * as privateConstants from '../constants/private';
import * as sepoliaConstants from '../constants/sepolia';
import * as goerliConstants from '../constants/goerli';
import * as mainConstants from '../constants/main';


export function getConstantsForNetwork(network) {
    switch (network) {
      case 'private':
        return privateConstants;
      case 'sepolia':
        return sepoliaConstants;
      case 'goerli':
        return goerliConstants;
        case 'main':
          return mainConstants;
      default:
        throw new Error('Invalid network specified.');
    }
  }