import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'

import router from './router'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        token: null,
        user: null
    },
    mutations: {
        authUser(state, userData) {
            state.token = userData.token;
            state.user = userData.user;
        },
        storeUser(state, user) {
            state.user = user;
        },
        clearAuthData(state) {
            state.token = null;
            state.user = null;
        }
    },
    actions: {
        setLogoutTimer({commit}, expirationTime) {
            setTimeout(() => {
                commit('clearAuthData');
            }, expirationTime * 1000)
        },
        signup({commit, dispatch}, authData) {
            axios.post('/signup', {
                username: authData.username,
                password: authData.password,
                confirmPassword: authData.confirmPassword,
            }).then(res => {
                    console.log(res);
                    console.log(res);
                    const token = res.data.data;
                    console.log('token=' + token);
                    localStorage.setItem('token', token);
                    let payload = JSON.parse(atob(token.split('.')[1]));
                    console.log(payload);
                    commit('authUser', {
                        token: token,
                        user: payload
                    });
                    const now = new Date();
                    const expiresInSec=payload.exp-now.getTime();
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', payload);
                    localStorage.setItem('expirationDate', payload.exp);
                    console.log(payload);
                    dispatch('storeUser', payload);
                    dispatch('setLogoutTimer', expiresInSec);
                    router.push("/dashboard");
                })
                .catch(error => console.log(error));
        },
        login({commit, dispatch}, authData) {
            axios.post('/login', {
                username: authData.username,
                password: authData.password
            })
                .then((res) => {
                    console.log(res);
                    const token = res.data.data;
                    console.log('token=' + token);
                    localStorage.setItem('token', token);
                    let payload = JSON.parse(atob(token.split('.')[1]));
                    console.log(payload);

                    const now = new Date();
                    const expiresInSec=payload.exp-now.getTime();
                    // const expirationDate = new Date(now.getTime() + res.data.expiresIn * 1000);
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', payload);
                    localStorage.setItem('expirationDate', payload.exp);
                    commit('authUser', {
                        token: token,
                        user: payload
                    });
                    dispatch('setLogoutTimer', expiresInSec)
                    router.push("/dashboard");
                })
                .catch(error => console.log(error))
        },
        tryAutoLogin({commit}) {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            const expirationDate = localStorage.getItem('expirationDate');
            console.log(expirationDate);
            const now = new Date();
            if (now >= new Date(expirationDate)) {
                return
            }
            const user = localStorage.getItem('user');
            commit('authUser', {
                token: token,
                user: user
            })
        },
        logout({commit}) {
            commit('clearAuthData');
            localStorage.removeItem('expirationDate');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.replace('/signin')
        },
        storeUser({commit, state}, userData) {
            if (!state.idToken) {
                return
            }
            globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
                .then(res => console.log(res))
                .catch(error => console.log(error))
        },
        fetchUser({commit, state}) {
            if (!state.token) {
                return
            }
            globalAxios.get('/users.json' + '?auth=' + state.token)
                .then(res => {
                    console.log(res);
                    const data = res.data;
                    const users = [];
                    for (let key in data) {
                        const user = data[key];
                        user.id = key;
                        users.push(user);
                    }
                    console.log(users);
                    commit('storeUser', users[0]);
                })
                .catch(error => console.log(error));
        }
    },
    getters: {
        user(state) {
            return state.user
        },
        isAuthenticated(state) {
            return state.token !== null
        }
    }
})