import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForms } from "../Context/StoreContext";
import { api, endpoints } from "../utils/api";

const Navabar = () => {
  const { isAuthenticated, logout } = useForms();
  const [showDrop, setShowDrop] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    console.log("🚪 Logging out user");
    await logout();
    navigate("/");
  };

  const createFormFunc = async () => {
    try {
      const response = await api.post(endpoints.forms.create, {
        formTitle: "Untitled Form",
        formDescription: "",
        data: [
          {
            data: {
              id: 1232212,
              question: "",
              titlePlaceholder: "Question",
              description: "",
              descriptionPlaceholder: "Description",
              option: "Shortanswer",
              required: false,
              select: true,
              name1: "question",
              name2: "description",
            },
            id: 1232212,
            multipleChoice: [{ index: 68798, value: "", id: Date.now() }],
            checkBoxes: [{ index: 156787, value: "", id: Date.now() }],
          },
        ],
      });
      console.log(response);
      navigate(`/create/${response.data.data.form._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link
            to="/"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Forms
            </span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <Link to="/login">Login</Link>
              </button>
            )}

            <button
              onClick={() => setShowDrop(!showDrop)}
              type="button"
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path stroke="currentColor" d="M1 1h15M1 7h15M1 13h15" />
              </svg>
            </button>
          </div>

          <div
            className={`items-center justify-between ${
              showDrop ? "" : "hidden"
            } w-full md:flex md:w-auto md:order-1`}
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    ` ${
                      isActive ? "text-blue-700" : "text-white"
                    } block py-2 px-3 rounded md:bg-transparent bg-gray-200  md:hover:bg-gray-800 md:p-2`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/template"
                  className={({ isActive }) =>
                    ` ${
                      isActive ? "text-blue-700" : "text-white"
                    } block py-2 px-3 rounded md:bg-transparent bg-gray-200  md:hover:bg-gray-800 md:p-2`
                  }
                >
                  template
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/createForm"
                  onClick={() => createFormFunc()}
                  className={({ isActive }) =>
                    ` ${
                      isActive ? "text-blue-700" : "text-white"
                    } block py-2 px-3 rounded md:bg-transparent bg-gray-200  md:hover:bg-gray-800 md:p-2`
                  }
                >
                  Create
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    ` ${
                      isActive ? "text-blue-700" : "text-white"
                    } block py-2 px-3 rounded md:bg-transparent bg-gray-200  md:hover:bg-gray-800 md:p-2`
                  }
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navabar;
