const getRoot = instance => {
  let fiber = instance.__fiber
  while (fiber.parent) {
    fiber = fiber.parent
  }
  // 获取到根节点 fiber 对象
  return fiber
}

export default getRoot
