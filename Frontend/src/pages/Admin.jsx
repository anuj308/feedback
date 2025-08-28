import { api, endpoints } from "../utils/api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminIndividualCard, DataAdminCard } from "../components";
import { useForms } from "../Context/StoreContext";

const Admin = () => {
  const { fId: formId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useForms();
  
  const [dropdown, setDropDown] = useState(false);
  const [selectOption, setSelectOption] = useState("summary");
  const [analytics, setAnalytics] = useState(null);
  const [responses, setResponses] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🔐 Not authenticated, redirecting to login");
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Clear admin data when user is no longer authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      console.log("🧹 User not authenticated, clearing admin data");
      setAnalytics(null);
      setResponses([]);
      setForm(null);
      setDropDown(false);
      setSelectOption("summary");
    }
  }, [isAuthenticated]);

  const toggleResponse = async () => {
    console.log("🔄 Toggling form responses for formId:", formId);
    try {
      const response = await api.patch(endpoints.forms.settings(formId), {
        acceptingResponses: !form?.settings?.acceptingResponses
      });
      console.log("✅ Form settings updated successfully");
      // Refresh form data
      fetchFormData();
    } catch (error) {
      console.error("❌ Error updating form settings:", error);
    }
  };

  const fetchFormData = async () => {
    console.log("📖 Fetching form data for formId:", formId);
    try {
      const formResponse = await api.get(endpoints.forms.getById(formId));
      console.log("📄 Form data loaded:", formResponse.data.data.form.formTitle);
      setForm(formResponse.data.data.form);
    } catch (error) {
      console.error("❌ Error fetching form:", error);
    }
  };

  const fetchAnalytics = async () => {
    console.log("📊 Fetching analytics for formId:", formId);
    try {
      const analyticsResponse = await api.get(endpoints.forms.analytics(formId));
      console.log("📈 Analytics loaded:", analyticsResponse.data.data);
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
    }
  };

  const fetchResponses = async () => {
    console.log("📋 Fetching responses for formId:", formId);
    try {
      const responsesResponse = await api.get(endpoints.forms.responses(formId));
      console.log("📝 Responses loaded:", responsesResponse.data.data.length, "responses");
      setResponses(responsesResponse.data.data);
    } catch (error) {
      console.error("❌ Error fetching responses:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchFormData(),
        fetchAnalytics(),
        fetchResponses()
      ]);
      setLoading(false);
    };
    
    if (formId) {
      loadData();
    }
  }, [formId]);

  if (loading) {
    return (
      <div className="mx-auto w-1/2 mt-28 rounded overflow-hidden shadow-lg">
        <div className="text-center p-8">Loading analytics...</div>
      </div>
    );
  }
  return (
    <div className="mx-auto w-1/2 mt-28 rounded overflow-hidden shadow-lg">
      <div className="my-8 mt-32 text-white mx-auto w-1/2 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div className="flex px-4 pt-4 flex-row justify-between">
          <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
            {analytics?.totalResponses || 0} responses
          </h5>
          <div>
            <button
              onClick={() => setDropDown((p) => !p)}
              className="inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-1.5"
              type="button"
            >
              <span className="sr-only">Open dropdown</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 3"
              >
                <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
              </svg>
            </button>
            <div
              id="dropdown"
              className={`z-10 ${
                dropdown ? "" : "hidden"
              } text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow  absolute  dark:bg-gray-700`}
            >
              <ul className="py-2">
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Download all responses (in csv)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Download all responses (in pdf)
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Delete all responses
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="text-white px-4 pt-4 flex justify-end">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={form?.settings?.acceptingResponses || false}
              onChange={toggleResponse}
            />
            <span className="me-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Accepting responses
            </span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="w-full bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <ul className="grid gap-4 md:grid-cols-3  w-full   px-10 text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800">
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "summary" ? "dark:text-blue-500" : "bg-white"
              } `}
              onClick={() => setSelectOption("summary")}
            >
              <button type="button" className="inline-block  w-auto p-4">
                Summary
              </button>
            </li>
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "question" ? "dark:text-blue-500" : "bg-white"
              } `}
              onClick={() => setSelectOption("question")}
            >
              <button
                type="button"
                className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                Question
              </button>
            </li>
            <li
              className={`me-2 w-auto rounded-ss-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 ${
                selectOption === "individual"
                  ? "dark:text-blue-500"
                  : "bg-white"
              } `}
              onClick={() => setSelectOption("individual")}
            >
              <button
                type="button"
                className="inline-block p-4 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                Individual
              </button>
            </li>
          </ul>
          <div id="defaultTabContent">
            <div
              className={`${
                selectOption === "summary" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
              id="about"
            >
              {analytics && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-900">Total Responses</h3>
                      <p className="text-2xl font-bold text-blue-600">{analytics.totalResponses}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-green-900">Completion Rate</h3>
                      <p className="text-2xl font-bold text-green-600">{analytics.completionRate}%</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-purple-900">Average Score</h3>
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.averageScore ? `${analytics.averageScore.toFixed(1)}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {analytics.questionStats && analytics.questionStats.length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Question Statistics</h3>
                      <div className="space-y-4">
                        {analytics.questionStats.map((stat, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {stat.question}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Responses: {stat.responseCount} | 
                              {stat.correctPercentage !== undefined && 
                                ` Correct: ${stat.correctPercentage.toFixed(1)}%`}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div
              className={`${
                selectOption === "question" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
              id="services"
            >
              <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Question Analysis
              </h2>
              {analytics?.questionStats && analytics.questionStats.length > 0 ? (
                <div className="space-y-6">
                  {analytics.questionStats.map((stat, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Question {index + 1}: {stat.question}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Total Responses</p>
                          <p className="text-xl font-bold text-blue-600">{stat.responseCount}</p>
                        </div>
                        {stat.correctPercentage !== undefined && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</p>
                            <p className="text-xl font-bold text-green-600">{stat.correctPercentage.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                      {stat.answerDistribution && Object.keys(stat.answerDistribution).length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Answer Distribution:</p>
                          <div className="space-y-2">
                            {Object.entries(stat.answerDistribution).map(([answer, count]) => (
                              <div key={answer} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-300">{answer}</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{count} responses</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No question data available.</p>
              )}
            </div>
            <div
              className={`${
                selectOption === "individual" ? "" : "hidden"
              } p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`}
            >
              {responses && responses.length > 0 ? (
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <AdminIndividualCard 
                      key={response._id} 
                      s={response} 
                      name={response.owner?.fullName || 'Anonymous'}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-300">No individual responses available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
