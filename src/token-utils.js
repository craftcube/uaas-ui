export const parsePayload = (token) => {
    return JSON.parse(atob(token.split('.')[1]));
};

export const getExpiresInSeconds = (token) => {
    return JSON.parse(atob(token.split('.')[1])).exp - new Date().getTime() / 1000;
};

export const saveTokenInStorage = (token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', parsePayload(token));
    localStorage.setItem('expirationDate', parsePayload(token).exp);
};
export const removeTokenFromStorage = () => {
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};