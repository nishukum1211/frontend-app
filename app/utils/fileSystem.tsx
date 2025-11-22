export const getFileName = (url:string) => {
  return url.substring(url.lastIndexOf('/') + 1).split('?')[0];
};