import { createTaskQueue, arrfield } from "../Misc"

const taskQueue = createTaskQueue()

const subTask = null

const getFirstTask = () => {
  // 从任务队列中获取任务
  const task = taskQueue.pop()

  // 返回最外层节点的 fiber 对象
  return {
    props: task.props,
    stateNode: task.dom,
    tag: "host_root",
    effects: [],
    child: null
  }
}

const reconcileChildren = (fiber, children) => {
  // children 可能是对象，也可能是数组
  // 将 children 转换成数组
  const arrfieldChildren = arrfield(children)

  let index = 0
  let numberOfElements = arrfieldChildren.length
  let element = null
  let newFiber = null
  let prevFiber = null

  while (index < numberOfElements) {
    element = arrfieldChildren[index]
    newFiber = {
      type: element.type,
      props: element.props,
      tag: "host_component",
      effects: [],
      effectTag: "placement",
      stateNode: null,
      parent: fiber
    }

    if (index == 0) {
      fiber.child = newFiber
    } else {
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber

    index++
  }
}

const executeTask = fiber => {
  reconcileChildren(fiber, fiber.props.children)
}

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
