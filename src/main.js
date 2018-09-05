import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'

import router from './router'
import store from './store'

axios.defaults.baseURL = 'http://localhost:9000';
// axios.defaults.headers.common['Authorization'] = 'fasfdsa'
axios.defaults.headers.get['Accepts'] = 'application/json';

const reqInterceptor = axios.interceptors.request.use(config => {
    if(store.state.token)
        config.headers['AUTH-TOKEN'] = store.state.token;
    console.log('Request Interceptor', config);
    return config
});
const resInterceptor = axios.interceptors.response.use(res => {
    console.log('Response Interceptor', res);
    return res
});

// axios.interceptors.request.eject(reqInterceptor);
// axios.interceptors.response.eject(resInterceptor);

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
