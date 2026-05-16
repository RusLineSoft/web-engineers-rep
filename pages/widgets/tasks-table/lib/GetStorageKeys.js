export var GetStorageKeys = () => Object.keys(localStorage || {}).filter(key => !key.includes('__VUE' || '__vue'));
