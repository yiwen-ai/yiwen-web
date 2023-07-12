import {
  Footer,
  GlobalStyles,
  Header,
  ThemeProvider,
} from '@yiwen-ai/component'
import { FetcherConfigProvider } from '@yiwen-ai/store'
import { useUserTheme } from '@yiwen-ai/util'
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import useConfig from './config.ts'
import Home from './routes/Home.tsx'
import LoginState from './routes/LoginState.tsx'
import NotFound from './routes/NotFound.tsx'
import Publication from './routes/Publication.tsx'

function Layout() {
  const [theme] = useUserTheme()

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Header
        title="亿文"
        menu={[
          { to: 'p/test111', label: 'P #111' },
          { to: 'p/test222', label: 'P #222' },
          { to: 'ptest404', label: 'P #404' },
        ]}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </ThemeProvider>
  )
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="*" element={<NotFound />} />
      <Route path="/" element={<Home />} />
      <Route path="/p/:id" element={<Publication />} />
      <Route path="/login/state" element={<LoginState />} />
    </Route>
  )
)

export default function App() {
  const config = useConfig()

  return (
    <FetcherConfigProvider value={config.fetcher}>
      <RouterProvider router={router} />
    </FetcherConfigProvider>
  )
}
