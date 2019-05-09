## 理解Buffer
### Buffer结构
- 挂载载global对象，不需要require
- slab分配机制
    - 三种分配状态：full(完全分配状态),partial(部分分配状态),empty（没有被分配状态）
    - 小对象buffer：通过局部变量pool存储，new Buffer(1)；new Buffer(8192)会造成第一个
    slab的8kb会被第一个1字节Buffer独占
    - 大的Buffer对象：通过C++中定义的SlowBuffer类存储
    
