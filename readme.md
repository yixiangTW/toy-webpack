通过chrome调试node `npm run dev:chrome [file name]` 打开chrome 开发者工具，点击node图标即可调试


babel 的原理

1. parse 把代码code变成AST
2. traverse 遍历AST进行修改
3. generate 把AST变成new_code


demo1 手动将let转成var   
demo2 自动将字符串代码转成es5   
demo3 将代码转成es5   
demo4 静态分析project_1依赖   
demo5 静态分析project_2依赖   
demo6 静态分析project_3循环依赖 递归报错   
demo7 静态分析project_3解决循环依赖递归报错   
