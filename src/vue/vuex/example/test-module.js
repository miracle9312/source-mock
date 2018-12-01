/* eslint-disable */
import ComponentA from "./component-a";
const str = "<div>test-1<component-a></component-a></div>"

export default {
  name: "TestModule",

  props: {},

  render (h) {
    return (
      <div>
      <div domPropsInnerHTML={str}></div>
      {
        this.show
          ? <component-a></component-a>
          : ""
      }
      </div>
  )
  },

  watch: {},

  computed: {},

  data () {
    return {
      show: true
    }
  },

  created () {},

  methods: {},

  components: {
    ComponentA
  }
};
/* eslint-disable */