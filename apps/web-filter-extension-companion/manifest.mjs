import packageJson from './project.json' with { type: 'json' };

/**
 * After changing, please reload the extension at `chrome://extensions`
 * @type {chrome.runtime.ManifestV3}
 */
const manifest = {
  manifest_version: 3,
  author: "Abbas Valliani",
  name: "Safe Kids AI Companion",
  description: "This tool ensures that Safe Kids AI at Home remains on the kids’ device and if a kid tries to delete that, this extension will let us know.",
  version: "0.0.0",
  permissions: ["management", "storage"],
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAglIE15mZNYtgcOWjuM0LQLWiPkzY9L1Czl6GwqC+nn8rx3E2mG5hMfGElBfNWU7p6++d6+YuUyWVO3m6PYIBBXezd6832AhhEi3YGtRxuCpnh1W7HhLlocQ7/Yy+zKRq02Otor0D20dyjeCLndqnjfYic8xL1k44x9nHhm1lgKYhQuWyJGbnM1ZGGPRo/2GXR0ZeBVtb+ptD+05Js6C/Xooy5AQ56W1tpIVEuOKR1olPXEMxy9q/pdjFiv+RG7dk8rCVBfsulaHilLtwtb9gqj+E30xr9r1HECcGE8xj1krzDwXTE18qYg7oOLC8GV6fb1yT2hs3iFNhfPACPJv70wIDAQAB",
  action: {
    default_popup: 'src/pages/popup/index.html',
    default_icon: {
      128: "icon128.png"
    },
  },
  background: {
    service_worker: 'src/pages/background/index.js',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ["*://*/*"],
      js: [
        'src/pages/content/index.js'
      ],
      // KEY for cache invalidation
      //css: ['assets/css/contentStyle<KEY>.chunk.css'],
    }
  ],
  icons: {
    128: "icon128.png",
  },
  web_accessible_resources: [],
  content_security_policy: {
    "extension_pages": "script-src 'self'; object-src 'self'"
  },
  cross_origin_embedder_policy: {
    "value": "require-corp"
  },
  cross_origin_opener_policy: {
    "value": "same-origin"
  },
};

export default manifest;
