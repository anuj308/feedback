import { api, endpoints } from "../utils/api";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminIndividualCard, DataAdminCard, AnalyticsSummaryCard } from "../components";
import { useForms } from "../Context/StoreContext";
import { usePageTitle } from "../hooks/usePageTitle";

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

  // Set dynamic page title based on form title
  usePageTitle(form?.title ? `Admin: ${form.title} - Feedback Form Builder` : "Admin Dashboard - Feedback Form Builder");

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
    try {
      // Use the settings endpoint to update accepting responses
      const response = await api.patch(endpoints.forms.settings(formId), {
        acceptingResponses: !form?.acceptingResponses
      });
      // Update local state immediately for better UX
      setForm(prev => ({
        ...prev,
        acceptingResponses: !prev?.acceptingResponses
      }));
      // Refresh form data to ensure consistency
      fetchFormData();
    } catch (error) {
      console.error("❌ Error updating form response setting:", error);
      // Revert local state on error
      setForm(prev => ({
        ...prev,
        acceptingResponses: prev?.acceptingResponses
      }));
      alert("Failed to update response setting. Please try again.");
    }
  };

  const deleteAllResponses = async () => {
    if (!window.confirm("Are you sure you want to delete all responses? This action cannot be undone.")) {
      return;
    }
    
    try {
      const response = await api.delete(endpoints.forms.deleteAllResponses(formId));
      // Refresh data after deletion
      await Promise.all([
        fetchAnalytics(),
        fetchResponses()
      ]);
      setDropDown(false); // Close dropdown
    } catch (error) {
      console.error("❌ Error deleting responses:", error);
      alert("Failed to delete responses. Please try again.");
    }
  };

  const fetchFormData = async () => {
    try {
      const formResponse = await api.get(endpoints.forms.getById(formId));
      setForm(formResponse.data.data.form);
    } catch (error) {
      console.error("❌ Error fetching form:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsResponse = await api.get(endpoints.forms.analytics(formId));
      setAnalytics(analyticsResponse.data.data);
    } catch (error) {
      console.error("❌ Error fetching analytics:", error);
    }
  };

  const fetchResponses = async () => {
    try {
      const responsesResponse = await api.get(endpoints.forms.responses(formId));
      setResponses(responsesResponse.data.data.responses || []);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show unpublished message if form is not published
  if (analytics && analytics.isPublished === false) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {analytics.message || "Publish your form to see analytics"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your form "{analytics.formTitle || form?.formTitle}" needs to be published before you can view analytics and responses.
            </p>
            <button
              onClick={() => navigate(`/create/${formId}`)}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go back to edit form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Form Analytics
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {analytics?.totalResponses || 0} total responses
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Download Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropDown(!dropdown)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Download as CSV
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Download as PDF
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteAllResponses();
                        }}
                      >
                        Delete all responses
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Accepting Responses Toggle */}
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={form?.acceptingResponses || false}
                  onChange={toggleResponse}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                  Accepting responses
                </span>
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setSelectOption("summary")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectOption === "summary"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setSelectOption("question")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectOption === "question"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Question Analysis
            </button>
            <button
              onClick={() => setSelectOption("individual")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectOption === "individual"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Individual Responses
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {selectOption === "summary" && (
            <div className="space-y-6">
              <AnalyticsSummaryCard analytics={analytics} responses={responses} />
            </div>
          )}

          {/* Question Analysis Tab */}
          {selectOption === "question" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Question Analysis
              </h2>
              {analytics?.questionStats && analytics.questionStats.length > 0 ? (
                <div className="space-y-6">
                  {analytics.questionStats.map((stat, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Question {index + 1}: {stat.question}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                          <span>Type: {stat.type}</span>
                          <span>•</span>
                          <span>Responses: {stat.responseCount}</span>
                          <span>•</span>
                          <span>Response Rate: {stat.responseRate}%</span>
                          {stat.skippedCount > 0 && (
                            <>
                              <span>•</span>
                              <span>Skipped: {stat.skippedCount}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Answer Distribution */}
                      {stat.answerDistribution && Object.keys(stat.answerDistribution).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Answer Distribution:</h4>
                          <div className="space-y-2">
                            {Object.entries(stat.answerDistribution).map(([answer, count]) => (
                              <div key={answer} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{answer}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({stat.answerPercentages && stat.answerPercentages[answer] ? stat.answerPercentages[answer] : '0'}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Option Distribution for checkboxes */}
                      {stat.optionDistribution && Object.keys(stat.optionDistribution).length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Option Distribution:</h4>
                          <div className="space-y-2">
                            {Object.entries(stat.optionDistribution).map(([option, count]) => (
                              <div key={option} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{option}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    ({stat.optionPercentages && stat.optionPercentages[option] ? stat.optionPercentages[option] : '0'}%)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Text Analytics */}
                      {stat.textAnalytics && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">Text Analysis:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.textAnalytics.averageWordCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Avg Words</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.textAnalytics.minWordCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Min Words</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.textAnalytics.maxWordCount}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Max Words</div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">{stat.textAnalytics.totalWords}</div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Total Words</div>
                            </div>
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
          )}

          {/* Individual Responses Tab */}
          {selectOption === "individual" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Individual Responses
              </h2>
              {responses && responses.length > 0 ? (
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <AdminIndividualCard 
                      key={response._id} 
                      s={response} 
                      name={response.respondentName || 'Anonymous'}
                      form={form}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-300">No responses available yet.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share your form to start collecting responses.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
