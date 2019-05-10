## 理解Buffer
### Buffer结构
- 挂载载global对象，不需要require
- slab分配机制
    - 三种分配状态：full(完全分配状态),partial(部分分配状态),empty（没有被分配状态）
    - 小对象buffer：通过局部变量pool存储，new Buffer(1)；new Buffer(8192)会造成第一个
    slab的8kb会被第一个1字节Buffer独占
    - 大的Buffer对象：通过C++中定义的SlowBuffer类存储
- Buffer转换
    - 字符串转buffer: new Buffer(str, [encoding]);
    - Buffer转字符串: buf.toString([encoding], [start], [end])，buffer对象由多种编码方式写入
    转字符串时需指定编码方式
- Buffer编码类型扩展模块:iconv iconv-lite
- 宽字节输入流读取乱码产生及解决
    ```var fs = require('fs');
   var rs = fs.createReadStream('test.md');
   var data = '';
   rs.on("data", function (chunk){
     data += chunk;
   });
   rs.on("end", function () {
     console.log(data);
   });
   ```
    - 产生原因：chunk.toString()中chunk是一段被截断的对象，不能完整表达宽字节的内容
    - 解决方案：setEncoding,在读取流时设置编码方式，会将被截断的对象保存，并与下次的读取流
    进行拼接解析，但是支持的编码类型比较有限
    - 使用Buffer.concat去拼接流
- Buffer与性能
    - 网络传输时使用Buffer能够提升传输效率
- highWaterMark
    
