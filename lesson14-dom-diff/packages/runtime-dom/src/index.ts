// 对元素可以进行节点操作
import { createRenderer } from "packages/runtime-core/src/renderer";
import { nodeOps } from "./nodeOps";
import { patchProp } from "./patchProp";

const renderOptions = Object.assign(nodeOps, { patchProp });

/**
 * @description 调用createRenderer传入DOM操作方法 
 *              再调用返回的render方法将虚拟DOM生成真实DOM渲染到容器中
 * @param vnode 虚拟DOM
 * @param container 容器 render(h("div", {}, "hello world"), app);
 */
export const render = (vnode, container) => {
  createRenderer(renderOptions).render(vnode, container);
};

// 将runtime-core的导出从runtime-dom导出
export * from "@vue/runtime-core";
