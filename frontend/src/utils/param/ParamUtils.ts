import {
  ParamChild,
  ParamParent,
  ParamType,
  ParamMap,
} from "utils/param/ParamType"

export function getChildParam(
  path: string,
  ParamMap: ParamMap,
): ParamChild | null {
  let result: ParamChild | null = null
  for (const node of Object.values(ParamMap)) {
    if (isParamChild(node)) {
      if (node.path === path) {
        result = node
      }
    } else {
      result = getChildParam(path, node.children)
    }
    if (result != null) {
      break
    }
  }
  return result
}

export function isParamChild(param: ParamType): param is ParamChild {
  return param.type === "child"
}

export function isParamParent(param: ParamType): param is ParamParent {
  return param.type === "parent"
}
