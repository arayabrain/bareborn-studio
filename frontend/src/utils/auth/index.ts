export const saveToken = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}
export const getToken = () => {
  return localStorage.getItem('access_token')
}
export const removeToken = () => {
  return localStorage.removeItem('access_token')
}
