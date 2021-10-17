import createApp from './createApp'

export default context => {
  return new Promise((resolve, reject) => {
    const { app, store } = createApp(context);
    return store.dispatch('fetchItem').then((data)=>{
        console.log(data, "=====data===")
        context.state = store.state;
        resolve(app)
        return app;
    })
  })
}
