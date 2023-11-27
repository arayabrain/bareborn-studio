export type ParamMap = {
  [paramKey: string]: ParamType
}

export type ParamType = ParamParent | ParamChild

export type ParamParent = {
  type: "parent"
  children: {
    [key: string]: ParamType
  }
}

export type ParamChild = {
  type: "child"
  dataType?: string
  doc?: string
  value: unknown
  path: string
}

export type ParamMapWithoutMeta = {
  [paramKey: string]: ParamTypeWithoutMeta
}
type ParamTypeWithoutMeta = ParamParent | ParamChildWithoutMeta
type ParamChildWithoutMeta = Omit<ParamChild, "dataType" | "doc">
