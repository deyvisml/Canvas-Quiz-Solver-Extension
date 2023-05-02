/* global chrome */

export const errorMessages = {
  standard: "\n\n```error\n🛑 A network or API error occurred! 🛑\n```",
  prompt: "\n\n```error\n🛑 Invalid prompt. 🛑\n```",
  denied: "\n\n```error\n🛑 ChatGPT error. Too many requests in a row. 🛑\n```",
  timeout: "\n\n```error\n🛑 Timeout error. 🛑\n```",
  abort: "\n\n```error\n🛑 User aborted search. 🛑\n```",
  closed: "\n\n```error\n🛑 Search aborted because popup was closed. 🛑\n```",
  notFound: "\n\n```error\n🛑 Couldn't find chat. Click new chat icon. 🛑\n```",
  invalidKey:
    "\n\n```error\n🛑 Your key is either incorrect or invalidated. 🛑\n```",
};
