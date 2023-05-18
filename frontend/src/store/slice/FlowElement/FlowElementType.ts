import { Elements, FlowTransform } from 'react-flow-renderer'

export const FLOW_ELEMENT_SLICE_NAME = 'flowElement'

export const NODE_TYPE_SET = {
  INPUT: 'input',
  ALGORITHM: 'algorithm',
} as const

export type NODE_TYPE = typeof NODE_TYPE_SET[keyof typeof NODE_TYPE_SET]

export type NodeData = (AlgorithmNodeData | InputNodeData) & {
  param?: {
    alignments: {
      path: string
      type: string
      value: Params[]
    }
  }
}

interface NodeDataBaseType<T extends NODE_TYPE> {
  label: string
  type: T
}

export interface InputNodeData
  extends NodeDataBaseType<typeof NODE_TYPE_SET.INPUT> {}

export interface AlgorithmNodeData
  extends NodeDataBaseType<typeof NODE_TYPE_SET.ALGORITHM> {}

export interface ElementCoord {
  x: number
  y: number
}

export type Params = {
  image_id: number | string
  x_pos: number
  y_pos: number
  z_pos: number
  x_rotate: number
  y_rotate: number
  z_rotate: number
  x_resize: number
  y_resize: number
  z_resize: number
}

export interface FlowElement {
  flowElements: Elements<NodeData>
  flowPosition: FlowTransform
  elementCoord: ElementCoord
}
