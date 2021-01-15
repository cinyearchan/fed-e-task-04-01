import { createTaskQueue, arrfield, createStateNode, getTag } from "../Misc"
// 任务队列
const taskQueue = createTaskQueue()
// 要执行的子任务
const subTask = null

const pendingCommit = null

const commitAllWork = fiber => {
  fiber.effects.forEach(item => {
    if (item.effectTag === "placement") {
      let fiber = item
      let parentFiber = item.parent
      // 类组件节点、函数组件节点 的 stateNode 不能保存真实的 dom 节点，一直向上寻找类组件的父级
      while (parentFiber.tag === "class_component" || parentFiber.tag === "function_component") {
        parentFiber = parentFiber.parent
      }
      if (fiber.tag === "host_component") {
        parentFiber.stateNode.appendChild(fiber.stateNode)
      }
    }
  })
}

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
      tag: getTag(element),
      effects: [],
      effectTag: "placement",
      parent: fiber
    }

    newFiber.stateNode = createStateNode(newFiber)

    // 为父级 fiber 添加子级 fiber
    if (index == 0) {
      fiber.child = newFiber
    } else {
      // 为 fiber 添加下一个兄弟 fiber
      prevFiber.sibling = newFiber
    }

    prevFiber = newFiber

    index++
  }
}

const executeTask = fiber => {
  // 构建子级 fiber 对象
  if (fiber.tag === "class_component") {
    // 构建类组件节点的子级
    reconcileChildren(fiber, fiber.stateNode.render())
  } else if (fiber.tag === "function_component") {
    // 构建函数组件节点的子级
    reconcileChildren(fiber, fiber.stateNode(fiber.props))
  } else {
    reconcileChildren(fiber, fiber.props.children)
  }
  // 如果子级存在，返回子级
  // 将这个子级当做父级，构建这个父级下的子级
  if (fiber.child) {
    return fiber.child
  }

  let currentExecutelyFiber = fiber

  // 构建同级
  while (currentExecutelyFiber.parent) {
    currentExecutelyFiber.parent.effects = currentExecutelyFiber.parent.effects.concat(
      currentExecutelyFiber.effects.concat([currentExecutelyFiber])
    )
    if (currentExecutelyFiber.sibling) {
      return currentExecutelyFiber.sibling
    }
    // 如果同级不存在，退回到当前节点的父级
    currentExecutelyFiber = currentExecutelyFiber.parent
  }

  pendingCommit = currentExecutelyFiber
}

const workLoop = deadline => {
  // 如果子任务不存在，就去获取子任务
  if (!subTask) {
    subTask = getFirstTask()
  }
  // 如果任务存在并且浏览器有空余时间就调用
  // executeTask 方法执行任务 (接收任务) => 返回新的任务
  while (subTask && deadline.timeRemaining() > 1) {
    subTask = executeTask(subTask)
  }

  if (pendingCommit) {
    commitAllWork(pendingCommit)
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
