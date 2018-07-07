export * from "./classes/CreateOptions.js";
export * from "./classes/CreateOptionsRequest.js";
export * from "./classes/CredentialAssertion.js";
export * from "./classes/CredentialAttestation.js";
export * from "./classes/GetOptions.js";
export * from "./classes/GetOptionsRequest.js";
export * from "./classes/Msg.js";
export * from "./classes/ServerResponse.js";
export * from "./classes/WebAuthnApp.js";

import * as defaultRoutes from "./lib/default-routes.js";
import * as utils from "./lib/utils.js";

// helpers
let helpers = {};
helpers.utils = utils;
helpers.defaultRoutes = defaultRoutes;
export { helpers as WebAuthnHelpers };
