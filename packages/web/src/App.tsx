import {
  Footer,
  GlobalStyles,
  Header,
  ThemeProvider,
} from '@yiwen-ai/component'
import { darkTheme, lightTheme, useDarkMode } from '@yiwen-ai/component/theme'
import {
  Outlet,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import Home from './routes/Home.tsx'
import NotFound from './routes/NotFound.tsx'
import Publication from './routes/Publication.tsx'

function Layout() {
  const darkMode = useDarkMode()

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <Header
        title="亿文"
        links={[
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
    </Route>
  )
)

export default function App() {
  return <RouterProvider router={router} />
}
