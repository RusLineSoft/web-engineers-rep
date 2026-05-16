export var SetItemStorage = (key, value) => {
  localStorage.setItem(JSON.stringify(key), JSON.stringify(value));
};
