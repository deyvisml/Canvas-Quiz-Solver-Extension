import { get_token } from "./token.js";
import { handle_search_request } from ".//handle.js";

const main = async (query, id) => {
  const token = await get_token();

  handle_search_request(query, token);
};

export { main };
