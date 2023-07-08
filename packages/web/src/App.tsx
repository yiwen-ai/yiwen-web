import {
  Footer,
  GlobalStyles,
  Header,
  ThemeProvider,
} from '@yiwen-ai/component'
import { darkTheme, lightTheme, useDarkMode } from '@yiwen-ai/component/theme'
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom'
import Index from './routes/Index'
import Publication from './routes/Publication'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Index /> },
      {
        path: 'p/:id',
        element: <Publication />,
      },
    ],
  },
])

function Layout() {
  return (
    <>
      <Header
        title="亿文"
        links={[
          { to: 'p/test111', label: 'P #111' },
          { to: 'p/test222', label: 'P #222' },
        ]}
      />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  const [darkMode] = useDarkMode()

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
