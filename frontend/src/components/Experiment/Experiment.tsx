import React from 'react'
import { ExperimentTable } from './ExperimentTable'

const Experiment = React.memo(() => {
  return (
    <div style={{ display: 'flex', height: 'calc(100% - 58px)' }}>
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          height: '100%',
          padding: 16,
        }}
      >
        <ExperimentTable />
      </main>
    </div>
  )
})

export default Experiment
