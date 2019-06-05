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
