import {
  ParamChild,
  ParamParent,
  ParamType,
  ParamMap,
  ParamMapWithoutMeta,
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

export function removeMetaFromParamMap(param: ParamMap) {
  const result: ParamMapWithoutMeta = {}
  for (const [k, v] of Object.entries(param)) {
    if (isParamChild(v)) {
      result[k] = {
        type: "child",
        value: v.value,
        path: v.path,
      }
    } else if (isParamParent(v)) {
      result[k] = {
        type: "parent",
        children: removeMetaFromParamMap(v.children),
      }
    }
  }
  return result
}
