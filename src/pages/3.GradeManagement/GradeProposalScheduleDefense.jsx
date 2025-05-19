import React, { useState, useEffect } from "react";
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
  useGetProposal,
  useGetReviewers,
  useGetChairpersons,
  useGetExternalPersons,
  useGetPanelists
} from "../../store/tanstackStore/services/queries";

import { createExternalPersonService, addNewPanelistService, createReviewerService, createChairpersonService, scheduleProposalDefenseService } from "../../store/tanstackStore/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient } from "../../utils/tanstack";

const GradeProposalScheduleDefense = () => {
  const { id: proposalId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Defense details
  const [defenseDate, setDefenseDate] = useState(null);
  const [defenseTime, setDefenseTime] = useState("");
  const [location, setLocation] = useState("");
  const [chairperson, setChairperson] = useState("");
  const [minutesSecretary, setMinutesSecretary] = useState("");

  // Lists of people
  const [availablePanelists, setAvailablePanelists] = useState([]);
  const [availableReviewers, setAvailableReviewers] = useState([]);

  // Selected people
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);

  // New panelist/reviewer form


  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Fetch proposal details using the custom hook
  const { data: proposalData, isLoading: proposalLoading } =
    useGetProposal(proposalId);

  //fetch chairpersons
  const {data: chairpersonData, isLoading:chairpersonLoading} = useGetChairpersons()

  // Fetch external persons
  const { data: externalPersonsData, isLoading: externalPersonsLoading } = 
    useGetExternalPersons();

  // Fetch available panelists
  const { data: panelistsData, isLoading: panelistsLoading } = useGetPanelists()

  useEffect(() => {
    if (panelistsData) {
      setAvailablePanelists(panelistsData.panelists || []);
    }
  }, [panelistsData]);

  // Fetch available reviewers using the custom hook
  const { data: reviewersData, isLoading: reviewersLoading } =
    useGetReviewers();

  useEffect(() => {
    if (reviewersData) {
      setAvailableReviewers(reviewersData.reviewers || []);
    }
  }, [reviewersData]);

  // Set existing reviewers from proposal when data is loaded
  useEffect(() => {
    if (proposalData?.proposal?.reviewers && reviewersData) {
      const existingReviewers = proposalData.proposal.reviewers.map(reviewerId => {
        const reviewer = reviewersData.reviewers.find(r => r.id === reviewerId.id);
        return reviewer || null;
      }).filter(Boolean);
      
      setSelectedReviewers(existingReviewers);
    }
  }, [proposalData?.proposal, reviewersData]);

  const proposal = proposalData?.proposal;
  const loading = proposalLoading || panelistsLoading || reviewersLoading;

  const validateForm = () => {
    const errors = {};

    if (!defenseDate) errors.defenseDate = "Defense date is required";
    if (!defenseTime) errors.defenseTime = "Defense time is required";
    if (!location.trim()) errors.location = "Location is required";
    if (!chairperson.trim()) errors.chairperson = "Chairperson is required";
    if (!minutesSecretary.trim())
      errors.minutesSecretary = "Minutes secretary is required";
    if (selectedPanelists.length === 0)
      errors.panelists = "At least one panelist is required";
    if (selectedReviewers.length === 0)
      errors.reviewers = "At least one reviewer is required";

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


  // Schedule defense mutation
  const scheduleDefenseMutation = useMutation({
    mutationFn: (defenseData) => scheduleProposalDefenseService(proposalId, defenseData.defenseDate, {
      location: defenseData.location,
      chairpersonId: defenseData.chairperson,
      minutesSecretaryId: defenseData.minutesSecretary,
      panelistIds: defenseData.panelists,
      reviewerIds: defenseData.reviewers,
    }),
    onSuccess: () => {
      setSuccess("Defense scheduled successfully");
      queryClient.resetQueries({queryKey: ["proposalDefenses"]})
      queryClient.invalidateQueries({queryKey: ["proposalDefenses"]})
      setTimeout(() => {
        navigate(-1, {replace: true });
      }, 2000);
    },
    onError: (err) => {
      console.error("Error scheduling defense:", err);
      setError(err.response?.data?.message || "Failed to schedule defense");
    }
  });

  

  const handleScheduleDefense = () => {
    if (!validateForm()) return;

    // Combine date and time
    const dateTimeString = `${format(
      defenseDate,
      "yyyy-MM-dd"
    )}T${defenseTime}:00`;
    const combinedDateTime = new Date(dateTimeString);

    const defenseData = {
      defenseDate: combinedDateTime.toISOString(),
      location,
      chairperson,
      minutesSecretary,
      panelists: selectedPanelists.map((p) => p.id),
      reviewers: selectedReviewers.map((r) => r.id),
    };

    scheduleDefenseMutation.mutate(defenseData);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (error && !proposal) {
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
          Schedule Proposal Defense
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
                    Proposal: {proposalData?.proposal?.title || "Loading..."}
                  </span>
                  <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                    Student:{" "}
                    {`${proposalData?.proposal?.student?.firstName} ${proposalData?.proposal?.student?.lastName}` ||
                      "Not Available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {proposal && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Title:</span>{" "}
                    {proposal.title}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Student:</span>{" "}
                    {`${proposal.student?.firstName} ${proposal.student?.lastName}`}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Registration Number:</span>{" "}
                    {proposal.student?.registrationNumber}
                  </p>
                </div>
                <div>
                  <p className="mb-2">
                    <span className="font-semibold">Submission Date:</span>{" "}
                    {new Date(proposal.submissionDate).toLocaleDateString()}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Status:</span>{" "}
                    {proposal.statuses?.find((s) => s.isCurrent)?.definition
                      ?.name || "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Defense Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative">
                <Label htmlFor="defense-date" className="mb-2">
                  Defense Date *
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={`w-full justify-start text-left font-normal ${
                        formErrors.defenseDate ? "border-red-500" : ""
                      }`}
                    >
                      {defenseDate ? (
                        format(defenseDate, "PPP")
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
                      <DialogTitle>Select Defense Date</DialogTitle>
                    </DialogHeader>
                    <div className="bg-white rounded-md border shadow-md p-4">
                      <Calendar
                        mode="single"
                        selected={defenseDate}
                        onSelect={(date) => {
                          setDefenseDate(date);
                          if (date) {
                            setFormErrors(prev => ({ ...prev, defenseDate: undefined }));
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
                            setDefenseDate(null);
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
                            if (defenseDate) {
                              setFormErrors(prev => ({ ...prev, defenseDate: undefined }));
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
                {formErrors.defenseDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.defenseDate}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="defense-time" className="mb-2">
                  Defense Time *
                </Label>
                <Input
                  id="defense-time"
                  type="time"
                  className={`${
                    formErrors.defenseTime ? "border-red-500" : ""
                  }`}
                  value={defenseTime}
                  onChange={(e) => setDefenseTime(e.target.value)}
                  style={{ fontSize: '1.00em' }} // Enlarge the default icon
                />
                {formErrors.defenseTime && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.defenseTime}
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

            {/* Chairperson Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Chairperson</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <div className="mb-4">
                  <AddPersonDialog
                    type="chairperson"
                    onSelect={(id) => setChairperson(id)}
                    availablePeople={chairpersonData?.chairpersons || []}
                    selectedPeople={chairperson ? [{ id: chairperson }] : []}
                    onCreateSuccess={(newChairperson) => {
                      setChairperson(newChairperson.id);
                      setSuccess("New chairperson added successfully");
                    }}
                  />
                </div>

                {chairperson && chairpersonData?.chairpersons && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">
                        Current Chairperson: {chairpersonData.chairpersons.find(c => c.id === chairperson)?.name}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-500 border-red-500 hover:bg-red-50"
                        onClick={() => setChairperson("")}
                      >
                        Remove
                      </Button>
                    </div>
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
                          <div >
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

            {/* Reviewers Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="flex-grow h-px bg-gray-200"></div>
                <span className="px-3 text-gray-500 bg-white">Reviewers</span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>

              <div className="border border-gray-200 rounded-md p-4">
                <div className="mb-4">
                  <AddPersonDialog
                    type="reviewer"
                    onSelect={handleAddReviewer}
                    availablePeople={availableReviewers}
                    selectedPeople={selectedReviewers}
                    onCreateSuccess={(newReviewer) => {
                      setAvailableReviewers([...availableReviewers, newReviewer]);
                      setSelectedReviewers([...selectedReviewers, newReviewer]);
                      setSuccess("New reviewer added successfully");
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Selected Reviewers</h3>
                  {selectedReviewers.length === 0 ? (
                    <p className="text-gray-500">No reviewers selected</p>
                  ) : (
                    <ul className="border border-gray-200 bg-gray-50 rounded-md divide-y divide-gray-200">
                      {selectedReviewers.map((reviewer) => (
                        <li
                          key={reviewer.id}
                          className="flex justify-between items-center p-3"
                        >
                          <div>
                            <p className="font-medium">{reviewer.name}</p>
                            <p className="text-sm text-gray-500">{reviewer.email}</p>
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
                <Button onClick={handleScheduleDefense} disabled={scheduleDefenseMutation?.isPending ? true : false }>
                  {scheduleDefenseMutation?.isPending ? "Scheduling..." : "Schedule Defense"}
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
  type, // 'panelist', 'reviewer', 'chairperson', 'minutesSecretary'
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
      queryClient.resetQueries({ queryKey: ['panelists'] })

      queryClient.invalidateQueries({ queryKey: ['panelists'] })
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create panelist");
    }
  });

  const createReviewerMutation = useMutation({
    mutationFn: createReviewerService,
    onSuccess: (data) => {
      onCreateSuccess(data.reviewer);
      setNewPerson({ name: "", email: "", institution: "" });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create reviewer");
    }
  });

  const createChairpersonMutation = useMutation({
    mutationFn: createChairpersonService,
    onSuccess: (data) => {
      onCreateSuccess(data.chairperson);
      setNewPerson({ name: "", email: "", institution: "" });
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Failed to create chairperson");
    }
  });

  const createExternalPersonMutation = useMutation({
    mutationFn: (values) =>  createExternalPersonService(values.name, values.email, values.role),
    onSuccess: (data) => {
      onCreateSuccess(data.externalPerson);
      setNewPerson({ name: "", email: "", institution: "" });
      queryClient.resetQueries({ queryKey: ['externalPersons'] })

      queryClient.invalidateQueries({ queryKey: ['externalPersons'] })
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
    } else if (type === 'reviewer') {
      createReviewerMutation.mutate({
        name: newPerson.name,
        email: newPerson.email
      });
    } else if (type === 'chairperson') {
      createChairpersonMutation.mutate({
        name: newPerson.name,
        email: newPerson.email
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
    createReviewerMutation.isPending || 
    createChairpersonMutation.isPending || 
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
          <TabsList className="grid w-full grid-cols-2 ">
            <TabsTrigger value="search" className="data-[state=active]:border-gray-300">Search</TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:border-gray-300 ">Create New</TabsTrigger>
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

export default GradeProposalScheduleDefense;
