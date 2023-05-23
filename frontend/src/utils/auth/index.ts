export const saveToken = (access_token: string) => {
  localStorage.setItem('access_token', access_token)
}
export const getToken = () => {
  return localStorage.getItem('access_token')
}
export const removeToken = () => {
  return localStorage.removeItem('access_token')
}
export const saveUserUID = (user_uid: string) => {
  localStorage.setItem('user_uid', user_uid)
}
export const getUserUID = () => {
  return localStorage.getItem('user_uid')
}
export const removeUserUID = () => {
  return localStorage.removeItem('user_uid')
}

export const isAdmin = (role?: number | string) => {
  return role === 1
}

export const isReseacher = (role?: string | number) => {
  return role === 20
}

export const optionsRole = [
  {
    code: 1,
    name: "Admin"
  },
  {
    code: 10,
    name: "Data Manager"
  },
  {
    code: 20,
    name: "User"
  }
]
