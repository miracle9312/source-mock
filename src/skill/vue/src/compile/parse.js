// 属性名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 标签名
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
// 开始标签-开启位置 -> /^<((?:[a-zA-Z_][\w\-\.]*\:)?[a-zA-Z_][\w\-\.]*)/
const startTagOpen = new RegExp(`^<${qnameCapture}`)
// 开始标签-闭合位置
const startTagClose = /^\s*(\/?)>/
// 结束标签
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)


const isUnaryTag = (tag)=> {
  const madeMap = {
    area: true,
    img: true,
    br: true
  }

  return madeMap[tag]
}

function parse(template, options) {

  parseHtml(template, {
    start(){},
    end(){}
  })

}


function parseHtml(html, options) {
  let index = 0;
  const stack = []
  while(html) {
    const startTagMatch = parseStartTag()
    if (startTagMatch) {
      handleStartTag()
    }
    console.log(startTagMatch, "=======startTagMatch=====")

    // End tag:
    const endTagMatch = html.match(endTag)
    if (endTagMatch) {
      advance(endTagMatch[0].length)
      const curIndex = index
      parseEndTag(endTagMatch[1], curIndex, index)
    }
    console.log(endTagMatch, "=======endTagMatch=====")

    function parseEndTag(tagName, start, end){
      let pos, lowerCasedTagName;
      lowerCasedTagName = tagName.toLowerCase()
      // 栈中遍历，寻找最近的同名标签
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
      for (let i = stack.length - 1; i >= pos; i--) {
        if(i > pos || !tagName) {
          throw new Error "has no matching end tag "
        }
      }
    }

    function handleStartTag() {
      const tagName = match.tagName
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
    }

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
          match.unarySlash = end[1]
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
const html = "<span id='123'><div></span>"

const options = {
  expectHTML: true,
  isUnaryTag,// 自闭和标签
}
parseHtml(html, options)
