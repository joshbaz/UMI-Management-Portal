import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import {
  useGetBook,
  useGetExternalPersons,
  useGetPanelists
} from "@/store/tanstackStore/services/queries";

import { createExternalPersonService, addNewPanelistService, createExaminerService, scheduleVivaService } from "@/store/tanstackStore/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "@/utils/tanstack";

const GradeBookScheduleViva = () => {
  const { id: bookId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Viva details
  const [vivaDate, setVivaDate] = useState(null);
  const [vivaTime, setVivaTime] = useState("");
  const [location, setLocation] = useState("");
  const [chairperson, setChairperson] = useState("");
  const [minutesSecretary, setMinutesSecretary] = useState("");

  // Lists of people
  const [availablePanelists, setAvailablePanelists] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);

  // Selected people
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch book details using the custom hook
  const { data: bookData, isLoading: bookLoading } = useGetBook(bookId);

  // Fetch external persons
  const { data: externalPersonsData, isLoading: externalPersonsLoading } = useGetExternalPersons();

  // Fetch available panelists
  const { data: panelistsData, isLoading: panelistsLoading } = useGetPanelists();

  useEffect(() => {
    if (panelistsData) {
      setAvailablePanelists(panelistsData.panelists || []);
    }
  }, [panelistsData]);

  // Get internal and external examiners from book data
  const { internalExaminers, externalExaminers } = useMemo(() => {
    if (!bookData?.book?.examinerAssignments) {
      return { internalExaminers: [], externalExaminers: [] };
    }

    const internal = bookData.book.examinerAssignments
      .filter(assignment => assignment.isCurrent && assignment.examiner?.type === "Internal")
      .map(assignment => assignment.examiner);

    const external = bookData.book.examinerAssignments
      .filter(assignment => assignment.isCurrent && assignment.examiner?.type === "External")
      .map(assignment => assignment.examiner);

    return { internalExaminers: internal, externalExaminers: external };
  }, [bookData?.book?.examinerAssignments]);

  useEffect(() => {
    if (externalExaminers) {
      setAvailableReviewers(externalExaminers || []);
    }
  }, [externalExaminers]);

  const book = bookData?.book;
  const loading = bookLoading || panelistsLoading;

  const validateForm = () => {
    const errors = {};

    if (!vivaDate) errors.vivaDate = "Viva date is required";
    if (!vivaTime) errors.vivaTime = "Viva time is required";
    if (!location.trim()) errors.location = "Location is required";
    if (!chairperson.trim()) errors.chairperson = "Internal examiner (chairperson) is required";
    if (!minutesSecretary.trim()) errors.minutesSecretary = "Minutes secretary is required";
    if (selectedPanelists.length === 0) errors.panelists = "At least one panelist is required";
    if (selectedReviewers.length === 0) errors.reviewers = "At least one external examiner (reviewer) is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPanelist = (panelistId) => {
    const panelist = availablePanelists.find((p) => p.id === panelistId);
    if (panelist && !selectedPanelists.some((p) => p.id === panelistId)) {
      setSelectedPanelists([...selectedPanelists, panelist]);
    }
  };

  const handleRemovePanelist = (panelistId) => {
    setSelectedPanelists(selectedPanelists.filter((p) => p.id !== panelistId));
  };

  const handleAddReviewer = (reviewerId) => {
    const reviewer = availableReviewers.find((r) => r.id === reviewerId);
    if (reviewer && !selectedReviewers.some((r) => r.id === reviewerId)) {
      setSelectedReviewers([...selectedReviewers, reviewer]);
    }
  };

  const handleRemoveReviewer = (reviewerId) => {
    setSelectedReviewers(selectedReviewers.filter((r) => r.id !== reviewerId));
  };

  // Schedule viva mutation
  const scheduleVivaMutation = useMutation({
    mutationFn: (vivaData) => scheduleVivaService(bookId, vivaData.vivaDate, {
      location: vivaData.location,
      chairpersonId: vivaData.chairperson,
      minutesSecretaryId: vivaData.minutesSecretary,
      panelistIds: vivaData.panelists,
      reviewerIds: vivaData.reviewers,
    }),
    onSuccess: () => {
      setSuccess("Viva scheduled successfully");
      queryClient.resetQueries({ queryKey: ["vivas"] });
      queryClient.invalidateQueries({ queryKey: ["vivas"] });
      setTimeout(() => {
        navigate(-1, { replace: true });
      }, 2000);
    },
    onError: (err) => {
      console.error("Error scheduling viva:", err);
      setError(err.response?.data?.message || "Failed to schedule viva");
    }
  });

  const handleScheduleViva = () => {
    if (!validateForm()) return;

    // Combine date and time
    const dateTimeString = `${format(vivaDate, "yyyy-MM-dd")}T${vivaTime}:00`;
    const combinedDateTime = new Date(dateTimeString);

    const vivaData = {
      vivaDate: combinedDateTime.toISOString(),
      location,
      chairperson,
      minutesSecretary,
      panelists: selectedPanelists.map((p) => p.id),
      reviewers: selectedReviewers.map((r) => r.id),
    };

    scheduleVivaMutation.mutate(vivaData);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error && !book) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Schedule Viva
        </h1>

        {/* Control Panel */}
        <div className="px-6 py-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <div className="flex flex-col">
                  <span className="text-lg font-medium text-gray-900">
                    Book: {bookData?.book?.title || "Loading..."}
                  </span>
                  <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                    Student:{" "}
                    {`${bookData?.book?.student?.firstName} ${bookData?.book?.student?.lastName}` ||
                      "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {book && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Book Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Title:</span>{" "}
                    {book.title}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Student:</span>{" "}
                    {`${book.student?.firstName} ${book.student?.lastName}`}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Registration Number:</span>{" "}
                    {book.student?.registrationNumber}
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Submission Date:</span>{" "}
                    {new Date(book.submissionDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    {book.statuses?.find((s) => s.isCurrent)?.definition?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Viva Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative">
                <Label htmlFor="viva-date" className="mb-2">
                  Viva Date *
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`w-full justify-start text-left font-normal ${
                        formErrors.vivaDate ? "border-red-500" : ""
                      }`}
                    >
                      {vivaDate ? (
                        format(vivaDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="w-auto p-4" 
                    style={{ position: 'absolute', zIndex: 9999 }}
                  >
                    <DialogHeader>
                      <DialogTitle>Select Viva Date</DialogTitle>
                    </DialogHeader>
                    <div className="bg-white rounded-md border shadow-md p-4">
                      <Calendar
                        mode="single"
                        selected={vivaDate}
                        onSelect={(date) => {
                          setVivaDate(date);
                          if (date) {
                            setFormErrors(prev => ({ ...prev, vivaDate: undefined }));
                          }
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                      <div className="flex justify-end mt-4">
                        <DialogTrigger>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setVivaDate(null);
                              document.querySelector('[role="dialog"]').close();
                            }}
                            className="mr-2 border-1 border-red-500 text-red-600"
                          >
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger>
                          <Button
                            className="bg-primary-500 hover:bg-primary-400"
                            onClick={() => {
                              if (vivaDate) {
                                setFormErrors(prev => ({ ...prev, vivaDate: undefined }));
                                document.querySelector('[role="dialog"]').close();
                              }
                            }}
                          >
                            Confirm
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {formErrors.vivaDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.vivaDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="viva-time" className="mb-2">
                  Viva Time *
                </Label>
                <Input
                  id="viva-time"
                  type="time"
                  className={`${
                    formErrors.vivaTime ? "border-red-500" : ""
                  }`}
                  value={vivaTime}
                  onChange={(e) => setVivaTime(e.target.value)}
                  style={{ fontSize: '1.00em' }}
                />
                {formErrors.vivaTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.vivaTime}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="location" className="mb-2">
                  Location *
                </Label>
                <Input
                  id="location"
                  type="text"
                  className={`${formErrors.location ? "border-red-500" : ""}`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {formErrors.location && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>
            </div>

            {/* Internal Examiner (Chairperson) Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Internal Examiner (Chairperson)</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                {internalExaminers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-red-500 mb-2">No internal examiner assigned to this book</p>
                    <p className="text-sm text-gray-600">An internal examiner must be assigned before scheduling a viva</p>
                  </div>
                ) : (
                <div className="mb-4">
                    <Label className="mb-2 block">Select Internal Examiner *</Label>
                    <div className="space-y-2">
                      {internalExaminers.map((examiner) => (
                        <div key={examiner.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id={`internal-${examiner.id}`}
                            name="chairperson"
                            value={examiner.id}
                            checked={chairperson === examiner.id}
                            onChange={(e) => {
                              setChairperson(e.target.value);
                              setFormErrors(prev => ({ ...prev, chairperson: undefined }));
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`internal-${examiner.id}`} className="flex-1 cursor-pointer">
                            <div className="p-3 border rounded-md hover:bg-gray-50">
                              <p className="font-medium">{examiner.name}</p>
                              <p className="text-sm text-gray-500">{examiner.primaryEmail}</p>
                              <p className="text-sm text-gray-400">{examiner.institution}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                </div>
                    {formErrors.chairperson && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.chairperson}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Minutes Secretary Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Minutes Secretary</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <div className="mb-4">
                  <AddPersonDialog
                    type="minutesSecretary"
                    onSelect={(id) => setMinutesSecretary(id)}
                    availablePeople={externalPersonsData?.externalPersons?.filter(p => p.role === "MINUTES_SECRETARY") || []}
                    selectedPeople={minutesSecretary ? [{ id: minutesSecretary }] : []}
                    onCreateSuccess={(newSecretary) => {
                      setMinutesSecretary(newSecretary.id);
                      setSuccess("New minutes secretary added successfully");
                    }}
                  />
                </div>

                {minutesSecretary && externalPersonsData?.externalPersons && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        Current Minutes Secretary: {externalPersonsData.externalPersons.find(s => s.id === minutesSecretary)?.name}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => setMinutesSecretary("")}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panelists Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Panelists</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <div className="mb-4">
                  <AddPersonDialog
                    type="panelist"
                    onSelect={handleAddPanelist}
                    availablePeople={availablePanelists}
                    selectedPeople={selectedPanelists}
                    onCreateSuccess={(newPanelist) => {
                      setAvailablePanelists([...availablePanelists, newPanelist]);
                      setSelectedPanelists([...selectedPanelists, newPanelist]);
                      setSuccess("New panelist added successfully");
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Panelists</h3>
                  {selectedPanelists.length === 0 ? (
                    <p className="text-gray-500">No panelists selected</p>
                  ) : (
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {selectedPanelists.map((panelist) => (
                        <li
                          key={panelist.id}
                          className="flex justify-between items-center p-3 bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{panelist.name}</p>
                            <p className="text-sm text-gray-500">{panelist.email}</p>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-red-500 border-1 border-red-500 hover:bg-red-50 hover:border-red-500"
                            onClick={() => handleRemovePanelist(panelist.id)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* External Examiners (Reviewers) Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">External Examiners (Reviewers)</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                {externalExaminers.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-red-500 mb-2">No external examiner assigned to this book</p>
                    <p className="text-sm text-gray-600">An external examiner must be assigned before scheduling a viva</p>
                  </div>
                ) : (
                <div className="mb-4">
                    <Label className="mb-2 block">Select External Examiners *</Label>
                    <div className="space-y-2">
                      {externalExaminers.map((examiner) => (
                        <div key={examiner.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`external-${examiner.id}`}
                            checked={selectedReviewers.some(r => r.id === examiner.id)}
                            onChange={() => {
                              if (selectedReviewers.some(r => r.id === examiner.id)) {
                                handleRemoveReviewer(examiner.id);
                              } else {
                                handleAddReviewer(examiner.id);
                              }
                              setFormErrors(prev => ({ ...prev, reviewers: undefined }));
                            }}
                            className="w-4 h-4"
                          />
                          <label htmlFor={`external-${examiner.id}`} className="flex-1 cursor-pointer">
                            <div className="p-3 border rounded-md hover:bg-gray-50">
                              <p className="font-medium">{examiner.name}</p>
                              <p className="text-sm text-gray-500">{examiner.primaryEmail}</p>
                              <p className="text-sm text-gray-400">{examiner.institution}</p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                    {formErrors.reviewers && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.reviewers}
                      </p>
                    )}
                </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Selected External Examiners</h3>
                  {selectedReviewers.length === 0 ? (
                    <p className="text-gray-500">No external examiners selected</p>
                  ) : (
                    <ul className="border border-gray-200 bg-gray-50 rounded-md divide-y divide-gray-200">
                      {selectedReviewers.map((reviewer) => (
                        <li
                          key={reviewer.id}
                          className="flex justify-between items-center p-3"
                        >
                          <div>
                            <p className="font-medium">{reviewer.name}</p>
                            <p className="text-sm text-gray-500">{reviewer.primaryEmail}</p>
                          </div>
                          <Button
                            variant="ghost"
                            className="text-red-500 border-1 border-red-500 hover:bg-red-50 hover:border-red-500"
                            onClick={() => handleRemoveReviewer(reviewer.id)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                className="text-red-500 border-red-500"
                onClick={() => navigate("/grade-management")}
              >
                Cancel
              </Button>

              <div className="space-x-4">
                <Button 
                  onClick={handleScheduleViva} 
                  disabled={scheduleVivaMutation?.isPending || internalExaminers.length === 0 || externalExaminers.length === 0}
                >
                  {scheduleVivaMutation?.isPending ? "Scheduling..." : "Schedule Viva"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success notification */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-green-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-md">
          <div className="flex">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-red-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AddPersonDialog = ({ 
  type,
  onSelect,
  availablePeople,
  selectedPeople,
  onCreateSuccess
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPerson, setNewPerson] = useState({ name: "", email: "", institution: "" });
  const [error, setError] = useState(null);

  // Define mutations for different person types
  const addPanelistMutation = useMutation({
    mutationFn: addNewPanelistService,
    onSuccess: (data) => {
      onCreateSuccess(data.panelist);
      setNewPerson({ name: "", email: "", institution: "" });
      queryClient.resetQueries({ queryKey: ['panelists'] });
      queryClient.invalidateQueries({ queryKey: ['panelists'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create panelist");
    }
  });

  const createExternalPersonMutation = useMutation({
    mutationFn: (values) => createExternalPersonService(values.name, values.email, values.role),
    onSuccess: (data) => {
      onCreateSuccess(data.externalPerson);
      setNewPerson({ name: "", email: "", institution: "" });
      queryClient.resetQueries({ queryKey: ['externalPersons'] });
      queryClient.invalidateQueries({ queryKey: ['externalPersons'] });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create minutes secretary");
    }
  });

  const filteredPeople = availablePeople.filter(
    (p) => 
      !selectedPeople.some((sp) => sp.id === p.id) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       p.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!newPerson.name.trim() || !newPerson.email.trim()) {
      setError("Name and email are required");
      return;
    }

    setError(null);

    if (type === 'panelist') {
      addPanelistMutation.mutate({
        name: newPerson.name,
        email: newPerson.email,
        institution: newPerson.institution
      });
    } else if (type === 'minutesSecretary') {
      createExternalPersonMutation.mutate({
        name: newPerson.name,
        email: newPerson.email,
        role: 'MINUTES_SECRETARY'
      });
    }
  };

  const isLoading = 
    addPanelistMutation.isPending || 
    createExternalPersonMutation.isPending;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full flex justify-end">
          <Button variant="outline" className="w-full bg-primary-500 text-white max-w-max">
            <Plus className="w-4 h-4 mr-2" />
            Add {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search" className="data-[state=active]:border-gray-300">Search</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:border-gray-300">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {filteredPeople.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">No {type}s found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPeople.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-2000 rounded-md cursor-pointer"
                      onClick={() => onSelect(person.id)}
                    >
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-gray-500">{person.email}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="border-1 border-primary-500 text-primary-500 hover:text-primary-500">
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPerson.email}
                  onChange={(e) => setNewPerson(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email"
                />
              </div>
              {type === 'panelist' && (
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={newPerson.institution}
                    onChange={(e) => setNewPerson(prev => ({ ...prev, institution: e.target.value }))}
                    placeholder="Enter institution"
                  />
                </div>
              )}
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GradeBookScheduleViva;