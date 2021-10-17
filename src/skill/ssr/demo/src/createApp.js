import Vue from 'vue'
import App from './app.vue'
import createStore from './createStore';

export default function createApp(context) {
  const store = createStore();
  const app = new Vue({
    store,
    render: h => h(App)
  });
  return {
    store,
    app
  };
};
