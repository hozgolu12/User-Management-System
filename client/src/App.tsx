import User from "./getUser/user.jsx";
import {createBrowserRouter} from "react-router-dom";
import AddUser from "./addUser/addUser.jsx";
import { RouterProvider } from "react-router-dom";
import Update from "./updateUser/updateUser.jsx";


function App() {
  const route = createBrowserRouter([
  {
    path: "/",
    element: <User />,
  },
  {
    path:"/add",
    element:<AddUser />
  },
  {
    path:"/update/:id",
    element:<Update />
  }
  ])
  return (
    <>
      <RouterProvider router={route} />
    </>
  )
}

export default App
