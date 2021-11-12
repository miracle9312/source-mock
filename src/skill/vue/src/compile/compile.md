## 编译本质

![avatar](https://pt-starimg.didistatic.com/static/starimg/img/meIDuhV02m1635674240401.png)

将html模板编译成可执行的render函数

## 柯里化实现核心编译抽离

compile的调用流程如下
```js

const baseCompile =()=> {
  // 执行核心编译流程，具体代码略去，各端不同
}
const baseOptions =()=> {
  // 各端编译传参不同
}
const createCompiler = createCompilerCreator(baseCompile)
const { compileToFunctions } = createCompiler(baseOptions)
const { render} =  compileToFunctions(template)
```

实际调用
- createCompiler 柯里化传参
- createCompilerCreator 柯里化编译

效果上我们可以得到
```js
// 支持web端的编译
const webCreateCompiler = createCompilerCreator(function($){return $.('')});
const webCompiler = webCreateCompiler({isChrome: true})
// 支持原生编译
const nativeCreateCompiler = createCompilerCreator(function(weex){return weex.('')});
const nativeCompiler = nativeCreateCompiler({isIOS: true})
```
通过该方式生成web,native的compileToFunctions；柯里化的实现过程如下
```js
const createCompilerCreator = (baseCompile) => {
  const createCompiler = (baseOptions) => {
    const compiler = (template, options) => {
      // 根据baseOptions调用baseCompile
    }

    return {compiler}
  }
  return createCompiler
}
```
以上高阶函数的构造出的最终函数本质上等价于
```js
const compiler = (baseCompile, baseOptions, template, options)=> {
  // 编译函数
}

```

## 模板解析
模板解析本质上是从一段html字符串上获取关键内容组合成ast对象，也是编译最核心的部分

### 标签解析

#### demo-开始标签
先实现一个最简单的解析demo

输入
```js
const html = "<div id='123'>"
```
输出
```json
{
    "tagName": "div",
    "attrs": [
        " id='123'"
    ],
    "start": 0,
    "end": 14
}
```
我们可以从vue源码中抽离出这样一段最简单的代码
```js
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/

function parseHtml(html, options) {
  let index = 0;
  while(html) {
    const startTagMatch = parseStartTag()
    // 通过html获取一个match对象
    function parseStartTag () {
      // 匹配开始标签-开启
      const start = html.match(startTagOpen);
      if (start) {
        // 构造标签ast
        const match = {
          tagName: start[1],
          attrs: [],
          start: index
        };
        advance(start[0].length);
        let end,
          attrs;
        while(
          !(end = html.match(startTagClose)) // 未到闭合
        && (attrs = html.match(attribute)) // 匹配到属性
          ) {
          advance(attrs[0].length)
          // push属性
          match.attrs.push(attrs[0])
        }

        if(end) {
          advance(end[0].length)
          match.end = index
          return match
        }
      }
    }
    // 移动指针，html替换
    function advance (n) {
      index += n
      // 模板替换
      html = html.substring(n)
    }
  }
}
```
通过指针移动+正则匹配遍历字符串，我们把需要的字符串不断的填到对象中，并将该html截断，当html所有内容都被替换时，相当于关键信息全部都已获取完毕，遍历过程结束

#### demo-结束标签

输入
```js
const html = "<div id='123'></div>"
```

这里只需要增加一个结束标签的识别
```js
const endTagMatch = html.match(endTag)
    if (endTagMatch) {
      advance(endTagMatch[0].length)
    }
```
### 闭合标签检验

通过栈管理标签闭合
```js
function parseHtml(html, options) {
  let index = 0;
  const stack = []
  while(html) {
    const startTagMatch = parseStartTag()
    if (startTagMatch) {
      handleStartTag()
    }

    // End tag:
    const endTagMatch = html.match(endTag)
    if (endTagMatch) {
      advance(endTagMatch[0].length)
      const curIndex = index
      parseEndTag(endTagMatch[1], curIndex, index)
    }

    function parseEndTag(tagName){
      let pos, lowerCasedTagName;
      lowerCasedTagName = tagName.toLowerCase()
      // 栈中遍历，寻找最近的同名标签
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
      for (let i = stack.length - 1; i >= pos; i--) {
        if(i > pos ) {
          throw new Error "has no matching end tag "
        }
      }
    }

    function handleStartTag() {
      const tagName = match.tagName
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
    }
    
    function parseStartTag () {}
    
     // 移动指针，html替换
    function advance (n) {}
  }
}

```
- 在解析到开始标签时将标签压入栈
- 在解析到结束标签时将结束标签与栈中的标签对比，找到match的index
- 从该位置往栈尾遍历，如果存在其他标签，说明这个标签没有闭合

### optimize
标记静态节点
理解静态节点和动态节点： 动态节点指标签上包含if，for等指令等节点，会根据条件动态渲染

```js
function markStatic (node) {
  node.static = isStatic(node)
 
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      markStatic(child)
      if (!child.static) {
        node.static = false
      }
    }
}

function isStatic () {
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
    !isBuiltInTag(node.tag) && // not a built-in
    isPlatformReservedTag(node.tag) && // not a component
    !isDirectChildOfTemplateFor(node) &&
    Object.keys(node).every(isStaticKey)
  ))
}
```
标记根节点
根节点：除了本身是一个静态节点外，必须满足拥有 children，并且 children 不能只是一个文本节点

### codegen

ast生成code
template
```js
<ul :class="bindCls" class="list" v-if="isShow">
    <li v-for="(item,index) in data" @click="clickItem(index)">{{item}}:{{index}}</li>
</ul>
```
render函数h
```js
with(this){
  return (isShow) ?
    _c('ul', {
        staticClass: "list",
        class: bindCls
      },
      _l((data), function(item, index) {
        return _c('li', {
          on: {
            "click": function($event) {
              clickItem(index)
            }
          }
        },
        [_v(_s(item) + ":" + _s(index))])
      })
    ) : _e()
}
```


