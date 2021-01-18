1. 请简述 React 16 版本中初始渲染的流程

   将 React 元素渲染到页面中，分为两个阶段，render 阶段和 commit 阶段

   - render 阶段负责创建 Fiber 数据结构并为 Fiber 节点打标记，标记当前 Fiber 节点要进行的 DOM 操作
   - commit 阶段负责根据 Fiber 节点标记（effectTag）进行相应的 DOM 操作



2. 为什么 React 16 版本中 render 阶段放弃了使用递归

   由于递归使用 JavaScript 自身的执行栈，一旦开始就无法停止，直到任务执行完成。

   如果 VirtualDOM 树的层级比较深，virtualDOM 的比对就会长期占用 JavaScript 主线程，由于 JavaScript 又是单线程的无法同时执行其他任务，所以在比对的过程中无法响应用户操作，无法即时执行元素动画，造成页面卡顿的现象

3. 请简述 React 16 版本中 commit 阶段的三个子阶段分别做了什么事情

   1. before mutation 阶段（执行 DOM 操作前）

      处理类组件的 getSnapShotBeforeUpdate 生命周期函数

   2. mutation 阶段（执行 DOM 操作）

      提交 HostComponent 的 side effect，即执行 DOM 操作（增删改）

   3. layout 阶段（执行 DOM 操作后）

      执行渲染完成之后的回调函数

4. 请简述 workInProgress Fiber 树存在的意义是什么

   当 workInProgress Fiber 树构建完成后，React 会使用它直接替换 current Fiber 树达到快速更新 DOM 的目的，因为 workInProgress 树是在内存中构建的，所以它的速度是非常快的，避免帧画面渲染过程中出现白屏