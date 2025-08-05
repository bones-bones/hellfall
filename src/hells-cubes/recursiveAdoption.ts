type RecursiveChild = (Node | RecursiveChild)[];
export const recursiveAdoption = (parent: Node, children: RecursiveChild) => {
  for (let i = 0; i < children.length; i++) {
    if (children[i] instanceof Array) {
      recursiveAdoption(children[i - 1] as Node, children[i] as RecursiveChild);
    } else {
      parent.appendChild(children[i] as Node);
    }
  }
};
