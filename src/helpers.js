const capitalize = (str) => {
  if (!str) {
    return '';
  }
  return str.split(' ').map((word) => {
    if (!word) {
      return '';
    }
    return word[0].toUpperCase() + word.slice(1);
  }).join(' ');
}

export { capitalize };
