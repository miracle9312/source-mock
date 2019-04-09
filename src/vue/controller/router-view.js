export default {
  functional: true,
  name: "RouterView",
  render: function (h, context) {
    const name = context.props.componentName;
    const component = this.$routes[name];
    const data = context.props.componentData;

    return h(component, data);
  },
  methods: {
    transition() {
      
    }
  }
};
