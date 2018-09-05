import Vue from 'vue'
import Vuex from 'vuex'
import axios from './axios-auth'
import globalAxios from 'axios'
import {
    getExpiresInSeconds,
    parsePayload,
    saveTokenInStorage,
    removeTokenFromStorage
} from './token-utils'

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
            let user = parsePayload(userData.token);
            console.log(user);
            state.user = user;
            saveTokenInStorage(userData.token);
        },
        storeUser(state, user) {
            state.user = user;
        },
        clearAuthData(state) {
            state.token = null;
            state.user = null;
            removeTokenFromStorage();
        }
    },
    actions: {
        setLogoutTimer({commit}, expirationTime) {
            setTimeout(() => {
                commit('clearAuthData');
                router.push("/signin");
            }, expirationTime * 1000)
        },
        signUp({commit, dispatch}, authData) {
            axios.post('/signup', {
                username: authData.username,
                password: authData.password,
                confirmPassword: authData.confirmPassword,
            }).then(res => {
                    console.log(res);
                    const token = res.data.data;
                    console.log('token=' + token);
                    commit('authUser', {
                        token: token
                    });
                    const expiresInSec=getExpiresInSeconds(token);
                    console.log(expiresInSec);
                    //dispatch('storeUser', payload);
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
                    console.log(parsePayload(token));
                    console.log('token=' + token);
                    commit('authUser', {
                        token: token
                    });
                    const expiresInSec=getExpiresInSeconds(token);
                    dispatch('setLogoutTimer', expiresInSec);
                    router.push("/dashboard");
                })
                .catch(error => console.log(error))
        },
        tryAutoLogin({commit,dispatch}) {
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
            commit('authUser', {
                token: token
            });
            const expiresInSec=getExpiresInSeconds(token);
            dispatch('setLogoutTimer', expiresInSec);
            router.replace('/')
        },
        logout({commit}) {
            commit('clearAuthData');
            router.replace('/signin')
        },
        storeUser({commit, state}, userData) {
            if (!state.token) {
                return
            }
            // globalAxios.post('/users.json' + '?auth=' + state.idToken, userData)
            //     .then(res => console.log(res))
            //     .catch(error => console.log(error))
        },
        fetchUser({commit, state}) {
            if (!state.token) {
                return
            }
            globalAxios.get('/hello')
                .then(res => {
                    console.log(res);
                    const data = res.data;
                    // const users = [];
                    // for (let key in data) {
                    //     const user = data[key];
                    //     user.id = key;
                    //     users.push(user);
                    // }
                    // console.log(users);
                    // commit('storeUser', users[0]);
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