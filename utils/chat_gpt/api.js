/* global chrome */

import { get_response } from "./browser_functions.js";
import { set_storage } from "./storage.js";

export const call_api = async (query, controller, { token }, convoInfo) => {
  await set_storage("query", [query, null]);

  await get_response(token.key, query, controller, convoInfo);

  return;
};
