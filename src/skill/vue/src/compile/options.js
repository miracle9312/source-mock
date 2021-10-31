const isUnaryTag = (tag)=> {
  const madeMap = {
    area: true,
    img: true,
    br: true
  }

  return madeMap[tag]
}
export default  {
  expectHTML: true,
  isUnaryTag,// 自闭和标签
}
