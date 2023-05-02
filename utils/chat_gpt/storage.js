const set_storage = async (key, value) => {
  await chrome.storage.local.set({
    [key]: value,
  });
};

const get_storage = async (key) => {
  const response = await chrome.storage.local.get([key]);
  const value = response[key];
  return value;
};

export { set_storage, get_storage };
