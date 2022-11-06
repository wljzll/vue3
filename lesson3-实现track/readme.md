## 1. 安装pnpm
- npm i pnpm -g

## 2. 初始化项目
- pnpm init

## 3. 可以添加一个.npmrc文件
``` javascript
// 添加个配置脚本
shamefully-hoist = true
// 添加这个配置是因为pnpm默认安装包是非扁平化的
// 添加这个配置就可以把包和包依赖的包都按照到node_modules下
```

## 4. 创建pnpm-workspace.yaml文件
```javascript
// 这个文件的目的是指定工作目录

// 添加过这个配置后再去安装vue会报错
/**
 * Running this command will add the dependency to 
 * the workspace root, which might not be what you want - if you really meant it,
 * make it explicit by running this command again with the -w flag (or --workspace-root). 
 * If you don't want to see this warning anymore, you may set the ignore-workspace-root-check setting to true. 
 */

// 这个时候安装得使用 pnpm install vue -w 来安装 -w是指将当前安装包安装到项目根目录下
```

## 5. 安装打包相关的包
```javascript
pnpm install esbuild typescript minimist -D -w
/**
 * esbuild: 打包构建
 * typescript: 这个不用解释
 * minimist: 解析命令行参数
 * 
*/
```

## 6．生成TS配置文件并进行配置
```javascript
pnpm tsc --init
```

## 7. 给每个模块都初始化一个包
```javascript
// 在reactivity目录下执行 pnpm init
// 在shared目录下执行 pnpm init

```

## 8. 修改每个模块的package.json
```javascript
{
  "name": "@vue/reactivity",
  "version": "1.0.0",
  "main": "index.js",
  "module": "dist/reactivity.esm-bundler.js", // 构建工具查找模块的时候是去找module字段而不是main字段
  "unpkg": "dist/reactivity.global.js", // 浏览器中通过脚本引用去找这个字段的路径
  "buildOptions": {
    "name": "VueReactivity", // 在global上使用时的全局变量名
    "formats": ["esm-browser", "esm-bundler", "cjs", "global"]
  }
}
```
## 9. 打包的格式有哪些？
```javascript
// node中使用的叫 commonjs => cjs
// es6中使用的叫 esm 也就是通过export/export defalut导出 import引入的方式使用
// 浏览器中使用的, 通过script标签引入, 就可以获得全局变量叫 iife

// es6打包Vue3.0又分成了两种方式: esm-bundler esm-browser

```
## 10. 如何让reactivity包依赖shared包
```javascript
pnpm install @vue/shared@workspack --filter @vue/reactivity
```

## 11. 在reactivity模块中引用shared模块中的方法
```javascript
// 什么都不配置的情况下我们引用TS自动导入的路径是
// import { isObject } from "../../shared/src";

// 但是我们肯定是想 import {isObject} from '@vue/shared';
// 但是我们这样写的话TS默认查找的路径是：
// module "E:/前端学习/vue3/node_modules/.pnpm/@vue+shared@3.2.41/node_modules/@vue/shared/dist/shared"
// 引用的是官方的Vue中的shared
// 所以我们要做一个TS配置, 让TS去找我们想要找的路径

/**
 * "baseUrl": "." // 这个配置的意思TS去找包的时候在当前根目录下找
 * "paths": { "@vue/*": ["packages/*/src"] } // 这个配置的意思是当我们在文件中使用@vue开头的路径去引入包时, TS要去根目录下的packages目录中的src目录中查找
*/

```

## 12. 打包配置
```javascript
// 去看script下的dev.js和根目录下的packages.json
```