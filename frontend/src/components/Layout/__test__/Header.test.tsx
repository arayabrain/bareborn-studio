import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"

import configureStore from "redux-mock-store"

import { describe, test, expect } from "@jest/globals"
import { render } from "@testing-library/react"

import Header from "components/Layout/Header"
import { selectModeStandalone } from "store/slice/Standalone/StandaloneSeclector"

// Mock the selector
jest.mock("store/slice/Standalone/StandaloneSeclector", () => ({
  selectModeStandalone: jest.fn(),
}))

// Create a mock store
const mockStore = configureStore([])
const initialState = {
  standalone: {
    mode: false, // or true, depending on your initial state
  },
}

describe("Header", () => {
  test("renders MultiUserHeader when not in standalone mode", () => {
    ;(selectModeStandalone as jest.Mock).mockReturnValue(false)

    const store = mockStore(initialState)
    const handleDrawerOpen = jest.fn()

    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Header handleDrawerOpen={handleDrawerOpen} />
        </MemoryRouter>
      </Provider>,
    )

    expect(asFragment()).toMatchSnapshot()
  })

  test("renders StandaloneHeader when in standalone mode", () => {
    ;(selectModeStandalone as jest.Mock).mockReturnValue(true)

    const store = mockStore(initialState)
    const handleDrawerOpen = jest.fn()

    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Header handleDrawerOpen={handleDrawerOpen} />
        </MemoryRouter>
      </Provider>,
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
