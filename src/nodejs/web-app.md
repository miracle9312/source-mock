## 开局只有四行代码
```js
http.createServer(function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World');
}).listen(1337, '127.0.0.1')
```
## 请求方法判断
restful类的web服务，请求方法决定资源的操作行为，PUT->新建，POST->更新，GET->查看，DELETE->删除
什么是restful https://juejin.im/entry/59f5f8cbf265da4327177e08
用一个买咖啡的例子进行描述
level0:面向前台，将所有操作及操作内容都通过统一的入口去处理
level1:面向资源，将所有操作需要更改的资源进行分类，不同类别的资源有各自的增删改查操作，所有的处理都直接面向资源
level2:面向操作，对相应资源的操作进行分类，所有请求都先分好操作类型，PUT->新建，POST->更新，GET->查看，DELETE->删除，一个行为对应一种控制器
level3:完美服务，
## csrf（跨站点请求伪造）攻击原理及防范措施
### 攻击原理
受攻击网站某银行网站a,在用户tom提交转账时的接口为a.example.com/?from=tom&count=100,
用户登录该网站时，登录信息会保存到cookie中，攻击者b建了一个网站b.example.com网站b，
有一个诱导链接<a href="a.example.com/?from=tom&count=100&to=b"></a>,此时用户tom在未退出登录的情形下，
去点击该链接，此时服务端会成功验证登录状态并成功转账到b。
### 防范措施
- http referrer：http请求头中会有一个referer字段，用于记录请求的来源，服务端通过判断请求来源是否为a.example.com
来避免攻击，但是referer在很多浏览器中可以被篡改
- token：服务端生成一个随机token，前端所有的请求中都带上这个token，每次校验该token是否与服务端保持一致来避免攻击
### 该注意什么
- token不要存在本地的任何地方，攻击这个可能会通过xss获取token，再通过csrf来进行攻击
### 相关链接
- CSRF 攻击的应对之道：https://www.ibm.com/developerworks/cn/web/1102_niugang_csrf/index.html
- 浅谈CSRF攻击方式：https://www.cnblogs.com/hyddd/archive/2009/04/09/1432744.html


## 路由映射
### 手工映射
- 原理：use(pathRegExp, controller)，将路由信息和控制器写入配置文件形成关联，请求进入时通过
解析路径，执行相应的控制器。
- 参数：/path1/path2/:param形式的路径解析，访问路径形如path1/path2/xxx时，将xxx通过正则获取，赋值到
req.params.param上，作为后续控制器调用时的参数

### 自动映射
- 原理：约定一个固定的路由格式：/controller/action/param1/param2/param3，按约定找controller目录下的user
文件，将其require出来后调用action，其余作为参数传入

### Restful
- 作用：在路由中体现对资源的操作
- 实现：在路由映射中包含请求操作的条件，同一路由如果请求方法不同，将可能调用不同的控制器

## 页面渲染

### 内容响应
- mime:响应头中content-type会包含mime信息，该信息用于标志返回文件的类型，客户端根据不同类型，执行不同的操作
application/json->json,application/xml->xml
- 附件下载：直接下载文件，Content-Disposition: attachment; filename="filename.ext"参照页面服务长图导出功能
- 响应json：ajax请求
- 响应跳转：网站重定向

### 如何实现一个模板引擎
- 正则匹配，返回替换模板变量后的模板
- 创建函数，将变量输出为值，得到最终模板
- 转义和渲染逻辑的支持
- 渲染性能相关：模板首次转义后存入缓存

### bigpipe渲染实现原理
- 输出骨架：包含两部分，第一部分是包含bigpipe资源的html骨架文件，第二部分是bigpipe渲染事件订阅的scipt脚本
- 输出渲染脚本：当后端处理完数据请求时，将数据作为事件参数，输出的渲染脚本中是一个触发渲染事件的方法
- bigpipe是什么：内核是一个事件发布订阅的模块，结合服务端的分段输出，在返回数据时候触发带数据的渲染
- bigpipe解决什么问题：对于需要一次性请求超大数据量的页面，通过分段输出的方式，先进行骨架的渲染，再进行数据内容的填充



