// need to make sure we aren't affected by overlapping namespaces
// and that we dont affect the app with our namespace
// mostly a fix for web3's BigNumber if AMD's "define" is defined...
let __define;

/**
 * Caches reference to global define object and deletes it to
 * avoid conflicts with other global define objects, such as
 * AMD's define function
 */
const cleanContextForImports = () => {
  __define = global.define;
  try {
    global.define = undefined;
  } catch (_) {
    console.warn('MetaMask - global.define could not be deleted.');
  }
};

/**
 * Restores global define object from cached reference
 */
const restoreContextAfterImports = () => {
  try {
    global.define = __define;
  } catch (_) {
    console.warn('MetaMask - global.define could not be overwritten.');
  }
};

cleanContextForImports();

/* eslint-disable import/first */
import log from 'loglevel';
import { v4 as uuid } from 'uuid';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { initializeProvider } from '@metamask/providers/dist/initializeInpageProvider';
import shouldInjectProvider from '../../shared/modules/provider-injection';

// contexts
const CONTENT_SCRIPT = 'metamask-contentscript';
const INPAGE = 'metamask-inpage';

restoreContextAfterImports();

log.setDefaultLevel(process.env.METAMASK_DEBUG ? 'debug' : 'warn');

//
// setup plugin communication
//

let myProvider = window.ethereum;
// let otherProviders = null;

if (shouldInjectProvider()) {
  // setup background connection
  const metamaskStream = new WindowPostMessageStream({
    name: INPAGE,
    target: CONTENT_SCRIPT,
  });

  initializeProvider({
    connectionStream: metamaskStream,
    logger: log,
    shouldShimWeb3: true,
    providerInfo: {
      uuid: uuid(),
      name: 'AIPay',
      icon: process.env.METAMASK_BUILD_ICON,
      rdns: process.env.METAMASK_BUILD_APP_ID,
    },
  });
  const provider = window.ethereum;
  Object.defineProperty(provider, 'isMetaMask', {
    value: false,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  Object.defineProperty(provider, 'isYourCustomWallet', {
    value: true,
    writable: false,
    enumerable: true,
    configurable: false,
  });
  myProvider = provider;
  console.log(myProvider, 'window.ethereum=========');
}
// 创建一个 observer 来监视 window.ethereum 属性的变化
// eslint-disable-next-line no-undef
const observer = new MutationObserver(() => {
  if (window.ethereum && !window.ethereum.isYourCustomWallet) {
    console.log('不是我们的provider，替换为我们的provider');
    // 当 MetaMask 插件注入自己的 provider 时，立即替换掉它
    // otherProviders = window.ethereum;
    window.ethereum = myProvider;
  }
});
// 开始监视 window 对象
observer.observe(document.documentElement, {
  attributes: true,
  childList: true,
  subtree: true,
});
