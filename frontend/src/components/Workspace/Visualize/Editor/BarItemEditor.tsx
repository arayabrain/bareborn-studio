import { FC } from "react"

import { SaveFig } from "components/Workspace/Visualize/Editor/SaveFig"

export const BarItemEditor: FC = () => {
  return (
    <div style={{ margin: "10px", padding: 10 }}>
      <SaveFig />
    </div>
  )
}