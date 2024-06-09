/**
 * @zh 返回最顶层根节点（HTMLDocument | ShadowRoot）。
 * @en 'null' if the node is not attached to the DOM, the root node (HTMLDocument | ShadowRoot) otherwise
 *
 * @param {Node} node 要检查是否连接到 DOM 的节点。
 * @returns {(null | HTMLDocument | ShadowRoot)} 如果节点未连接到 DOM，则返回 'null'；否则返回根节点（HTMLDocument | ShadowRoot）。
 *
 */
export function attachedRoot(node: Node): null | HTMLDocument | ShadowRoot {
  /* istanbul ignore next */
  if (typeof node.getRootNode !== 'function') {
    // Shadow DOM not supported (IE11), lets find the root of this node
    while (node.parentNode) node = node.parentNode

    // The root parent is the document if the node is attached to the DOM
    if (node !== document)
      return null

    return document
  }

  const root = node.getRootNode()

  // @zh 如果节点连接到 DOM，组成的根节点就是文档
  // @en The composed root node is the document if the node is attached to the DOM
  if (root !== document && root.getRootNode({ composed: true }) !== document)
    return null

  return root as HTMLDocument | ShadowRoot
}
