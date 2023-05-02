/* global chrome */

import { call_api } from "./api.js";
import { get_storage } from "./storage.js";

let timestamp = Date.now();
let controller = null;
let convoInfo = {
  convoId: null,
  parentMessageId: null,
};

chrome.storage.onChanged.addListener(async (changed) => {
  if (changed.lock) {
    if (changed.lock.newValue === true) {
      showLoader = true;
      loading = true;
    } else {
      showLoader = false;
      loading = false;
    }
  }
});

const setInfo = async () => {
  const savedConvoInfo = await get_storage("convoInfo");

  if (savedConvoInfo != null) {
    convoInfo = {
      convoId: savedConvoInfo[0],
      parentMessageId: savedConvoInfo[1],
    };
  }
};

const handle_search_request = async (query, token) => {
  convoInfo = {
    convoId: null,
    parentMessageId: null,
  };
  const newController = new AbortController();
  controller = newController;

  const savedConvoInfo = await get_storage("convoInfo");
  console.log("savedConvoInfo:", savedConvoInfo);

  //await call_api(query, newController, token, convoInfo);
};

const handleCancelRequest = async () => {
  if (Date.now() - timestamp > 250) {
    controller.abort("user");
  }
};

export { handle_search_request };
