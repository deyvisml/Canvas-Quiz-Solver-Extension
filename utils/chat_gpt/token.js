import { set_storage, get_storage } from "./storage.js";

const get_token = async () => {
  let validToken = false;
  let noWifi = false;
  let token = undefined;

  const lock = await get_storage("lock");

  if (lock === true) {
    const accessToken = await get_storage("accessToken");

    if (accessToken != null) {
      token = { key: accessToken, type: "access" };
      validToken = true;
    }
  } else {
    const controller = new AbortController();
    setTimeout(() => controller.abort("timeout"), 3000);

    try {
      const resp = await fetch("https://chat.openai.com/api/auth/session", {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        signal: controller ? controller.signal : null,
      });

      if (resp.status === 403) {
        validToken = false;
      } else {
        const data = await resp.json().catch(() => ({}));
        if (data.accessToken) {
          await set_storage("accessToken", data.accessToken);
          token = { key: data.accessToken, type: "access" };
          validToken = true;
        } else {
          validToken = false;
        }
      }
    } catch (err) {
      console.log(err);
      noWifi = true;
      validToken = true;
    }
  }

  return { token, validToken, noWifi };
};

export { get_token };
