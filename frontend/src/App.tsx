import React from 'react'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'
import { SnackbarProvider, SnackbarKey, useSnackbar } from 'notistack'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Project from './components/Project'
import Layout from 'components/Layout'
import Dashboard from 'pages/Dashboard'
import Login from 'pages/Login'
import Signup from 'pages/Signup'

const App: React.FC = () => {
  return (
    <SnackbarProvider
      maxSnack={5}
      action={(snackbarKey) => (
        <SnackbarCloseButton snackbarKey={snackbarKey} />
      )}
    >
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project" element={<Project />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SnackbarProvider>
  )
}

const SnackbarCloseButton: React.FC<{ snackbarKey: SnackbarKey }> = ({
  snackbarKey,
}) => {
  const { closeSnackbar } = useSnackbar()
  return (
    <IconButton onClick={() => closeSnackbar(snackbarKey)} size="large">
      <Close style={{ color: 'white' }} />
    </IconButton>
  )
}

export default App
