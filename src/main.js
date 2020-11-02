import Vue from 'vue'
import App from './App.vue'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import VueGeolocation from 'vue-browser-geolocation';

Vue.use(VueGeolocation);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
