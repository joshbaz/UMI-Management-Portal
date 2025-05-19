import React, { useState, useEffect } from "react";
import { Download, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { format } from "date-fns";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { useMutation } from "@tanstack/react-query";
import { generateDefenseReportService } from "../../store/tanstackStore/services/api";
import { queryClient } from "../../utils/tanstack";


/**
 * Component for generating and downloading a report on the Proposal Defense
 * Includes student registration number, topic, supervisors, and verdict
 */
const GradeProposalDefenseReport = ({ isOpen, onClose, proposal }) => {
  const [activeTab, setActiveTab] = useState("preview");
  const [reportData, setReportData] = useState({
    studentName: "",
    regNo: "",
    topic: "",
    supervisors: "",
    verdict: "",
    date: format(new Date(), "dd MMMM yyyy"),
    department: "COLLEGE OF HUMANITIES AND SOCIAL SCIENCES",
    supervisor: "",
  });

  // Prepare report data when the component mounts or proposal changes
  useEffect(() => {
    if (proposal) {
      const student = proposal.student;
      const topic = proposal.title;

      // Correctly access supervisors from the student
      const supervisors =
        student?.supervisors
          ?.map((sup) => `${sup.user.firstName} ${sup.user.lastName}`)
          .join(", ") || "None";

      // Get first supervisor for signature
      const mainSupervisor =
        student?.supervisors?.length > 0
          ? `${student.supervisors[0].user.firstName} ${student.supervisors[0].user.lastName}`
          : "Supervisor Name";

      // Get defense verdict from the proposal statuses
      const defenseStatus = proposal.statuses?.find(
        (status) =>
          status.definition.name.includes("passed-proposal") ||
          status.definition.name.includes("failed-proposal")
      );

      const verdict = defenseStatus
        ? defenseStatus.definition.name.includes("passed")
          ? "PASSED"
          : "FAILED"
        : "Not Available";

      setReportData({
        studentName: `${student?.firstName || ""} ${student?.lastName || ""}`,
        regNo: student?.regNo || "N/A",
        topic: topic || "N/A",
        supervisors,
        verdict,
        date: format(new Date(), "dd MMMM yyyy"),
        department: "COLLEGE OF HUMANITIES AND SOCIAL SCIENCES",
        supervisor: mainSupervisor,
      });
    }
  }, [proposal]);

  // Mutation to record the defense report generation
  const generateDefenseReportMutation = useMutation({
    mutationFn: (formData) =>
      generateDefenseReportService(proposal.id, formData),
    onSuccess: () => {
      try {
        // Reset the queries instead of invalidating
        queryClient.resetQueries(['proposalDefenseReports', proposal.id]);
        toast.success("Defense report generated and saved successfully");
        onClose();
      } catch (error) {
        console.error("Error updating queries:", error);
        // Still close the dialog and show success message even if query update fails
        toast.success("Defense report generated and saved successfully");
        onClose();
      }
    },
    onError: (error) => {
      console.error("Error saving defense report:", error);
      toast.error(error?.message || "Failed to save defense report. Please try again.");
    },
  });

  const generateDocument = async () => {
    try {
      // Fetch the template
      const response = await fetch('/template.docx');
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const templateData = await response.arrayBuffer();

      // Load the docx file as binary content
      const zip = new PizZip(templateData);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '${',
          end: '}'
        }
      });

      // Render the document (replace all variables with their values)
      doc.render({
        date: reportData.date,
        studentName: reportData.studentName,
        regNo: reportData.regNo,
        supervisor: reportData.supervisor,
        topic: reportData.topic,
        supervisors: reportData.supervisors,
        verdict: reportData.verdict,
        department: reportData.department,
      });

      // Output the document
      const blob = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // Generate filename using student name
      const sanitizedName = reportData.studentName
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .toLowerCase(); // Convert to lowercase
      
      const filename = `Proposal_Defense_Report_${sanitizedName}.docx`;

      // Create a FormData object for file upload
      const formData = new FormData();
      formData.append("title", `Defense Report for ${reportData.studentName}`);
      formData.append("studentName", reportData.studentName);
      formData.append("regNo", reportData.regNo);
      formData.append("topic", reportData.topic);
      formData.append("supervisors", reportData.supervisors);
      formData.append("verdict", reportData.verdict);
      formData.append("reportDate", reportData.date);
      formData.append("department", reportData.department);

      // Convert blob to File object and append to FormData
      const reportFile = new File([blob], filename, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      formData.append("reportFile", reportFile);

      // Send the data to the server for storage first
      await generateDefenseReportMutation.mutateAsync(formData);

      // After successful upload, save the document to the user's device
      saveAs(blob, filename);
    } catch (error) {
      console.error("Error generating document:", error);
      toast.error("Failed to generate defense report");
    }
  };

  const handleDownloadReport = () => {
    if (!proposal) {
      toast.error("No proposal data available");
      return;
    }

    generateDocument();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-semibold leading-6">
            Proposal Defense Report
          </DialogTitle>
          <DialogDescription>
            Preview and download the proposal defense report
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mt-2"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Preview
            </TabsTrigger>
            <TabsTrigger value="download" className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-0 p-0">
            <div
              className="border rounded-md p-6 bg-white overflow-y-auto"
              style={{ maxHeight: "50vh" }}
            >
              {/* Header with university logo */}
              <div className="text-center mb-6 border-b pb-4">
                <div className="flex justify-center items-center mb-4">
                  <div className="border-r border-gray-300 pr-4">
                    <h1 className="text-xl font-bold">Uganda Management </h1>
                    <p className="text-xs">P.O. Box 7062</p>
                    <p className="text-xs">Kampala, Uganda</p>
                    <p className="text-xs">Cable: 255465</p>
                  </div>
                  <div className="mx-4 w-16">
                    <img
                      src="/images/makerere-logo.png"
                      alt="Makerere Logo"
                      className="w-full"
                    />
                  </div>
                  <div className="border-l border-gray-300 pl-4">
                    <h1 className="text-xl font-bold">Institute</h1>
                    <p className="text-xs">Tel: 256-414-31939</p>
                    <p className="text-xs">E-mail: principal@chuss.mak.ac.ug</p>
                    <p className="text-xs">Website: www.chuss.mak.ac.ug</p>
                  </div>
                </div>

                <div className="border inline-block py-1 px-4 mb-4">
                  <h2 className="text-sm font-semibold uppercase">
                    {reportData.department}
                  </h2>
                  <p className="text-sm">Office of the Principal</p>
                </div>

                <h3 className="text-lg font-semibold mt-2">
                  PROPOSAL DEFENSE REPORT
                </h3>
              </div>

              <div className="mb-4">
                <p className="text-sm">{reportData.date}</p>
                <p className="text-sm mt-3">TO: {reportData.studentName}</p>
                <p className="text-sm">FROM: Graduate Studies Committee</p>
                <p className="text-sm mt-3">
                  Dear {reportData.studentName.split(" ")[0]},
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold">
                  RE: Research Proposal Defense Result
                </p>
                <p className="text-sm mt-1">
                  This letter confirms that your research proposal titled "
                  {reportData.topic}" has been defended and the verdict is{" "}
                  <span
                    className={`font-bold ${
                      reportData.verdict === "PASSED"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {reportData.verdict}
                  </span>
                  .
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold">Student Information:</p>
                <p className="text-sm">
                  Registration Number: {reportData.regNo}
                </p>
                <p className="text-sm">Supervisors: {reportData.supervisors}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold">Key Points:</p>
                <ol className="list-decimal ml-5 text-sm space-y-1">
                  <li>
                    <p className="font-medium">Next Steps</p>
                    <ul className="list-disc ml-5 text-sm">
                      {reportData.verdict === "PASSED" ? (
                        <>
                          <li>
                            Incorporate any feedback from the defense committee
                          </li>
                          <li>Schedule initial supervisor meeting</li>
                          <li>Begin data collection</li>
                          <li>Submit detailed timeline within two weeks</li>
                        </>
                      ) : (
                        <>
                          <li>Review committee feedback</li>
                          <li>Revise proposal as directed</li>
                          <li>Schedule meeting with supervisors</li>
                          <li>Prepare for re-defense</li>
                        </>
                      )}
                    </ul>
                  </li>
                </ol>
              </div>

              <p className="text-sm mt-4">
                Please contact your supervisor or the department office if you
                need any clarification.
              </p>

              <p className="text-sm mt-4">Best regards,</p>

              <div className="mt-8">
                <p className="text-sm">{reportData.supervisor}</p>
                <p className="text-sm">Supervisor</p>
                <p className="text-sm">
                  Department of{" "}
                  {
                    reportData.department.split(" ")[
                      reportData.department.split(" ").length - 1
                    ]
                  }
                </p>
                <p className="text-sm">Makerere University</p>
              </div>

              <p className="text-sm mt-4">cc: Student File</p>
            </div>
          </TabsContent>

          <TabsContent value="download" className="mt-0 p-0">
            <div
              className="space-y-4 overflow-y-auto"
              style={{ maxHeight: "50vh" }}
            >
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-700 mb-2">
                  About this report
                </h3>
                <p className="text-sm text-blue-700">
                  You are about to download an official Proposal Defense Report
                  for {reportData.studentName} ({reportData.regNo}). This
                  document uses the official Uganda Management Institute letterhead
                  template.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <h3 className="font-medium mb-2">Report will include:</h3>
                <ul className="text-sm text-gray-600 space-y-2 list-disc ml-5">
                  <li>University letterhead and logo</li>
                  <li>
                    Student Registration Number:{" "}
                    <span className="font-medium text-gray-800">
                      {reportData.regNo}
                    </span>
                  </li>
                  <li>
                    Student Name:{" "}
                    <span className="font-medium text-gray-800">
                      {reportData.studentName}
                    </span>
                  </li>
                  <li>
                    Proposal Topic:{" "}
                    <span className="font-medium text-gray-800 break-words">
                      {reportData.topic}
                    </span>
                  </li>
                  <li>
                    Supervisors:{" "}
                    <span className="font-medium text-gray-800">
                      {reportData.supervisors}
                    </span>
                  </li>
                  <li>
                    Defense Verdict:{" "}
                    <span
                      className={`font-medium ${
                        reportData.verdict === "PASSED"
                          ? "text-green-600"
                          : reportData.verdict === "FAILED"
                          ? "text-red-600"
                          : "text-gray-800"
                      }`}
                    >
                      {reportData.verdict}
                    </span>
                  </li>
                  <li>Official supervisor signature</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 pt-2 border-t">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownloadReport}
            disabled={generateDefenseReportMutation.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
          >
            {generateDefenseReportMutation.isPending ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="h-4 w-4" /> Download Report
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradeProposalDefenseReport;
