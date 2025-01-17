export function randomName() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 15; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }

  return result;
}

export function truncateString(str) {
  if (str.length > 17) return str.substring(0, 14) + '...';
  return str;
}

export function getFileExtension(filename) {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1 || dotIndex === 0 || dotIndex === filename.length - 1) {
    return '';
  }
  return filename.slice(dotIndex + 1);
}

export function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }
}