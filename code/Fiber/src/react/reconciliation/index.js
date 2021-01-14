import { createTaskQueue } from "../Misc"

const taskQueue = createTaskQueue()

const subTask = null

const getFirstTask = () => {}

const executeTask = fiber => {}

const workLoop = deadline => {
  if (!subTask) {
    subTask = getFirstTask()
  }
  // 如果任务存在并且浏览器有空余时间就调用
  // executeTask 方法执行任务 (接收任务) => 返回新的任务
  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }
}

const performTask = deadline => {
  // 执行任务
  workLoop(deadline)
  // 判断任务是否存在
  // 判断任务队列中是否还有任务
  // 如果有，再一次告诉浏览器在空闲时间执行任务
  if (subTask || !taskQueue.isEmpty()) {
    requestIdleCallback(performTask)
  }
}

export const render = (element, dom) => {
  /**
   * 1. 向任务队列中添加任务（通过 vdom 对象构建 fiber 对象）
   * 2. 指定在浏览器空闲时执行任务
   */
  taskQueue.push({
    dom,
    props: { children: element }
  })
  // 指定在浏览器空闲的时间去执行任务
  requestIdleCallback(performTask)
}
