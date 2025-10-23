import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileSpreadsheet, AlertTriangle, Check } from "lucide-react";
import * as XLSX from "xlsx";
import { useGetAllCampuses, useGetAllCourses, useUploadStudents } from "@/store/tanstackStore/services/queries";
import { toast } from "sonner";

const AddStudentUpload = () => {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [proceeded, setProceeded] = useState(false);
  const [showOnlyDuplicates, setShowOnlyDuplicates] = useState(false);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    fullname: "",
    email: "",
    registrationNumber: "",
    gender: "",
    course: "",
    yearOfEnrollment: "",
    campus: "",
    school: "",
    department: "",
    age: "",
    phoneNumber: "",
    intakePeriod: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStats, setUploadStats] = useState({ processed: 0, success: 0, failed: 0 });
  const [failedRows, setFailedRows] = useState([]);

  // Reference data
  const { data: campusesData } = useGetAllCampuses();
  const { data: coursesData } = useGetAllCourses({ page: 1, limit: 10000, isActive: true });
  const uploadStudentsMutation = useUploadStudents();

  const normalize = useCallback((s) => String(s || "").trim().toLowerCase(), []);
  const compact = useCallback((s) => normalize(s).replace(/[^a-z0-9]/g, ""), [normalize]);

  // Uganda city short code → full location name mapping
  const ugCityCodes = useMemo(() => ({
    KLA: "Kampala",
    EBB: "Entebbe",
    JIN: "Jinja",
    MBR: "Mbarara",
    MBA: "Mbarara",
    GUL: "Gulu",
    MBL: "Mbale",
    MSK: "Masaka",
    MAS: "Masaka",
    ARU: "Arua",
    FPO: "Fort Portal",
    FPT: "Fort Portal",
    HOI: "Hoima",
    TOR: "Tororo",
    LIR: "Lira",
    MUK: "Mukono",
    SOR: "Soroti",
  }), []);

  const ugCityMapByKey = useMemo(() => {
    const map = new Map();
    Object.entries(ugCityCodes).forEach(([code, name]) => {
      map.set(compact(code), name);
    });
    return map;
  }, [ugCityCodes, compact]);

  const expandCityCode = useCallback((value) => {
    const key = compact(value);
    return ugCityMapByKey.get(key) || value;
  }, [ugCityMapByKey, compact]);

  const campusByKey = useMemo(() => {
    const map = new Map();
    const campuses = campusesData?.campuses || [];
    campuses.forEach((c) => {
      // Map by name, code, and location separately - all in lowercase for case-insensitive matching
      if (c.name) map.set(compact(c.name), c);
      if (c.code) map.set(compact(c.code), c);
      if (c.location) map.set(compact(c.location), c);
    });
    return map;
  }, [campusesData?.campuses, compact]);

  const campusById = useMemo(() => {
    const map = new Map();
    const campuses = campusesData?.campuses || [];
    campuses.forEach((c) => map.set(c.id, c));
    return map;
  }, [campusesData?.campuses]);

  const findCampusId = useCallback((locationOrName) => {
    const key = compact(locationOrName);
    return campusByKey.get(key)?.id || "";
  }, [campusByKey, compact]);

  const coursesIndex = useMemo(() => {
    const list = coursesData?.courses || [];
    // index by code+campusId
    const map = new Map();
    list.forEach((course) => {
      const codeKey = compact(course.code);
      const campusId = course.campus?.id || "";
      const k = `${codeKey}__${campusId}`;
      if (!map.has(k)) map.set(k, course);
    });
    return map;
  }, [coursesData?.courses, compact]);

  const findCourseId = useCallback((shortCode, campusId) => {
    if (!shortCode || !campusId) return "";
    const k = `${compact(shortCode)}__${campusId}`;
    return coursesIndex.get(k)?.id || "";
  }, [coursesIndex, compact]);

  const handleFiles = useCallback(async (f) => {
    if (!f) return;
    setFile(f);
    const buffer = await f.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    // Normalize keys to a consistent shape expected by preview
    const normalized = json.map((r, index) => {
      const registrationNumber = r["REG. NO"] || r["Reg No"] || r["RegNo"] || r["Registration Number"] || r["registrationNumber"] || "";
      const fullname =
        r["Name"] || r["Fullname"] || r["Full Name"] || r["fullname"] || "";
      const email = r["Email"] || r["Email Address"] || r["email"] || "";
      const gender = r["Gender"] || r["gender"] || r["GENDER"] || "";
      const course = r["Course"] || r["COURSE"] || r["course"] || r["Program"] || r["program"] || "";
      const specialisation = r["Specialisation"] || r["SPECIALISATION"] || r["specialisation"] || "";
      const yearOfEnrollment = r["Year of Enrollment"] || r["Year"] || r["yearOfEnrollment"] || r["Enrollment Year"] || r["EnrollmentYear"] || "";
      const campus = r["Campus"] || r["campus"] || "";
      const school = r["School"] || r["SCHOOL"] || r["school"] || "";
      const department = r["Department"] || r["DEPARTMENT"] || r["department"] || "";
      const age = r["Age"] || r["AGE"] || r["age"] || "";
      const phoneNumber = r["Phone Number"] || r["Phone"] || r["phone"] || r["phoneNumber"] || r["PhoneNumber"] ||"";

      // Derive fields from REG. NO structure: 
      // Format 1: year/programdegree/course/location/month/number (e.g., 2021/BSC/CS/KLA/MAY/001)
      // Format 2: year/typecourse/location/enrollmentyear (e.g., 21/MMSPAM/KLA/MAY/001)
      let derivedYear = "";
      let derivedCourse = "";
      let derivedCampus = "";
      let derivedIntake = "";
      if (registrationNumber) {
        const parts = String(registrationNumber).split("/").map((p) => p.trim());
        if (parts.length >= 5) {
          // Check if it's format 2 (year/typecourse/location/enrollmentyear)
          if (parts.length === 5) {
            derivedYear = parts[0] || "";
            derivedCourse = parts[1] || ""; // typecourse (e.g., MMSPAM)
            derivedCampus = parts[2] || ""; // location (e.g., KLA)
            derivedIntake = parts[3] || ""; // enrollment period (e.g., MAY)
          } else if (parts.length >= 6) {
            // Format 1: year/programdegree/course/location/month/number
            derivedYear = parts[0] || "";
            derivedCourse = parts[2] || "";
            derivedCampus = parts[3] || ""; // location
            derivedIntake = parts[4] || ""; // month
          }
        }
      }

      const normalizedProvidedYear = /^\d{2}$/.test(String(yearOfEnrollment).trim())
        ? expandTwoDigitYear(yearOfEnrollment)
        : String(yearOfEnrollment).trim();
      const normalizedDerivedYear = /^\d{2}$/.test(String(derivedYear).trim())
        ? expandTwoDigitYear(derivedYear)
        : String(derivedYear).trim();
      const finalYear = isValidYear(normalizedProvidedYear)
        ? normalizedProvidedYear
        : (isValidYear(normalizedDerivedYear) ? normalizedDerivedYear : "");

      const campusKeyInput = campus || derivedCampus;
      // Try to find campus by the original input first, then by expanded location code
      let campusId = findCampusId(campusKeyInput);
      let campusName = campusKeyInput;
      
      if (!campusId) {
        // Expand city code to get the actual location name (e.g., "KLA" -> "Kampala")
        const expandedLocation = expandCityCode(campusKeyInput);
        
        // First find the campus object that has this location
        const campusWithLocation = campusByKey.get(compact(expandedLocation));
        if (campusWithLocation) {
          campusId = campusWithLocation.id;
          campusName = campusWithLocation.name;
        } else {
          campusName = expandedLocation;
        }
        console.log(campusId, campusName);
      } else {
        campusName = campusById.get(campusId)?.name || campusKeyInput;
      }
      const shortCode = (specialisation || course || derivedCourse);
      const courseId = findCourseId(shortCode, campusId);

      return {
        _row: index + 1,
        fullname: String(fullname).trim(),
        email: String(email).trim(),
        registrationNumber: String(registrationNumber).trim(),
        gender: String(gender).trim(),
        course: String((specialisation || course || derivedCourse)).trim(),
        yearOfEnrollment: String(finalYear).trim(),
        campus: String(campusName).trim(),
        campusId,
        school: String(school).trim(),
        department: String(department).trim(),
        age: String(age).trim(),
        phoneNumber: String(phoneNumber).trim(),
        intakePeriod: String(derivedIntake).trim(),
        courseId,
        courseShortCode: String(shortCode).trim(),
      };
    });

    setRows(normalized);
    setProceeded(false);
  }, []);

  const onDrop = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const f = e.dataTransfer?.files?.[0];
      if (f) await handleFiles(f);
    },
    [handleFiles]
  );

  const onBrowse = useCallback(() => inputRef.current?.click(), []);

  const onInputChange = useCallback(
    async (e) => {
      const f = e.target.files?.[0];
      if (f) await handleFiles(f);
    },
    [handleFiles]
  );
  const isValidYear = useCallback((y) => {
    if (!y) return false;
    const s = String(y).trim();
    if (!/^\d{4}$/.test(s)) return false;
    const n = Number(s);
    const current = new Date().getFullYear() + 1; // allow next year's intake
    return n >= 1900 && n <= current;
  }, []);
  const expandTwoDigitYear = useCallback((y) => {
    if (!y) return "";
    const s = String(y).trim();
    if (/^\d{4}$/.test(s)) return s;
    if (!/^\d{2}$/.test(s)) return "";
    const yy = Number(s);
    const currentYY = (new Date().getFullYear() + 1) % 100;
    return String(yy <= currentYY ? 2000 + yy : 1900 + yy);
  }, []);

  const duplicatesInfo = useMemo(() => {
    if (!rows.length) return { count: 0, dupRegNos: new Set(), dupEmails: new Set() };
    const regNoCount = new Map();
    const emailCount = new Map();
    for (const r of rows) {
      if (r.registrationNumber) regNoCount.set(r.registrationNumber, (regNoCount.get(r.registrationNumber) || 0) + 1);
      if (r.email) emailCount.set(r.email.toLowerCase(), (emailCount.get(r.email.toLowerCase()) || 0) + 1);
    }
    const dupRegNos = new Set([...regNoCount.entries()].filter(([, c]) => c > 1).map(([k]) => k));
    const dupEmails = new Set([...emailCount.entries()].filter(([, c]) => c > 1).map(([k]) => k));
    const count = rows.filter((r) => dupRegNos.has(r.registrationNumber) || dupEmails.has(r.email.toLowerCase())).length;
    return { count, dupRegNos, dupEmails };
  }, [rows]);

  const isDuplicate = useCallback(
    (r) => {
      if (!r) return false;
      const emailKey = r.email?.toLowerCase?.() || "";
      return duplicatesInfo.dupRegNos.has(r.registrationNumber) || duplicatesInfo.dupEmails.has(emailKey);
    },
    [duplicatesInfo]
  );

  const displayedRows = useMemo(() => {
    if (!showOnlyDuplicates) return rows;
    return rows.filter((r) => isDuplicate(r));
  }, [rows, showOnlyDuplicates, isDuplicate]);

  const startEdit = useCallback((row) => {
    setEditingRowId(row._row);
    setEditDraft({
      fullname: row.fullname,
      email: row.email,
      registrationNumber: row.registrationNumber || "",
      gender: row.gender || "",
      course: row.course || "",
      yearOfEnrollment: row.yearOfEnrollment || "",
      campus: row.campus || "",
      school: row.school || "",
      department: row.department || "",
      age: row.age || "",
      phoneNumber: row.phoneNumber || "",
      intakePeriod: row.intakePeriod || "",
    });
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingRowId(null);
    setEditDraft({
      fullname: "",
      email: "",
      registrationNumber: "",
      gender: "",
      course: "",
      yearOfEnrollment: "",
      campus: "",
      school: "",
      department: "",
      age: "",
      phoneNumber: "",
      intakePeriod: "",
    });
  }, []);

  const saveEdit = useCallback(() => {
    setRows((prev) => prev.map((r) => {
      if (r._row !== editingRowId) return r;
      const updated = { ...r, ...editDraft };
      // recompute campusId/name and courseId when campus/course change
      let recomputedCampusId = findCampusId(updated.campus);
      let recomputedCampusName = updated.campus;
      
      if (!recomputedCampusId) {
        // Expand city code to get the actual location name (e.g., "KLA" -> "Kampala")
        const expanded = expandCityCode(updated.campus);
        
        // First find the campus object that has this location
        const campusWithLocation = campusByKey.get(compact(expanded));
        if (campusWithLocation) {
          recomputedCampusId = campusWithLocation.id;
          recomputedCampusName = campusWithLocation.name;
        } else {
          recomputedCampusName = expanded;
        }
      } else {
        recomputedCampusName = campusById.get(recomputedCampusId)?.name || updated.campus;
      }
      const recomputedCourseId = findCourseId(updated.course, recomputedCampusId);
      return {
        ...updated,
        campusId: recomputedCampusId,
        campus: recomputedCampusName,
        courseId: recomputedCourseId,
        courseShortCode: updated.course,
      };
    }));
    setEditingRowId(null);
  }, [editingRowId, editDraft, expandCityCode, findCampusId, findCourseId, campusById]);

  const deleteRow = useCallback((rowId) => {
    setRows((prev) => prev.filter((r) => r._row !== rowId));
  }, []);

  const splitFullname = useCallback((name) => {
    const n = String(name || "").trim();
    if (!n) return { firstName: "", lastName: "" };
    const parts = n.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    const lastName = parts.pop();
    const firstName = parts.join(" ");
    return { firstName, lastName };
  }, []);

  const validateRowForUpload = useCallback((r) => {
    if (!r) return { ok: false, reason: "Empty row" };
    if (!r.fullname) return { ok: false, reason: "Missing fullname" };
    if (!r.registrationNumber) return { ok: false, reason: "Missing REG. NO" };
    if (!r.campusId) return { ok: false, reason: "Unknown campus" };
    if (!r.courseId) return { ok: false, reason: "Unknown course" };
    if (!isValidYear(r.yearOfEnrollment)) return { ok: false, reason: "Invalid year" };
    return { ok: true };
  }, [isValidYear]);

  const buildStudentPayload = useCallback((r) => {
    const { firstName, lastName } = splitFullname(r.fullname);
    return {
      firstName,
      lastName,
      email: r.email || undefined,
      phoneNumber: r.phoneNumber || undefined,
      age: r.age || undefined,
      gender: r.gender || undefined,
      registrationNumber: r.registrationNumber,
      yearOfEnrollment: r.yearOfEnrollment,
      intakePeriod: r.intakePeriod || undefined,
      campusId: r.campusId,
      courseId: r.courseId,
      // Optional fields if backend supports
      schoolName: r.school || undefined,
      departmentName: r.department || undefined,
    };
  }, [splitFullname]);

  const uploadAllStudents = useCallback(async () => {
    if (isUploading || uploadStudentsMutation.isPending) return;
    const total = displayedRows.length;
    if (!total) {
      toast.warning("No rows to upload");
      return;
    }

    setIsUploading(true);
    setUploadStats({ processed: 0, success: 0, failed: 0 });
    setFailedRows([]);

    // Filter out duplicates and invalid rows
    const validStudents = [];
    const skippedRows = [];

    for (const r of displayedRows) {
      // Skip duplicates
      if (isDuplicate(r)) {
        skippedRows.push({ row: r, error: "Duplicate (REG. NO or Email)" });
        continue;
      }
      
      const valid = validateRowForUpload(r);
      if (!valid.ok) {
        skippedRows.push({ row: r, error: valid.reason });
        continue;
      }
      
      const payload = buildStudentPayload(r);
      validStudents.push(payload);
    }

    if (validStudents.length === 0) {
      setIsUploading(false);
      toast.warning("No valid students to upload");
      setFailedRows(skippedRows);
      return;
    }

    try {
      const result = await uploadStudentsMutation.mutateAsync(validStudents);
      
      setIsUploading(false);
      
      // Process results from backend
      const { created, skipped, failed, skippedDetails, failedDetails } = result;
      
      // Combine all failed/skipped rows for display
      const allFailedRows = [
        ...skippedRows,
        ...(skippedDetails || []).map(detail => ({ row: displayedRows.find(r => r.registrationNumber === detail.registrationNumber), error: detail.reason })),
        ...(failedDetails || []).map(detail => ({ row: displayedRows.find(r => r.registrationNumber === detail.registrationNumber), error: detail.reason }))
      ].filter(Boolean);

      setFailedRows(allFailedRows);
      setUploadStats({ processed: total, success: created, failed: skipped + failed });

      if (created > 0) {
        toast.success(`Successfully uploaded ${created} students. ${skipped + failed} were skipped/failed.`);
        if (failed === 0 && skipped === 0) {
          setTimeout(() => navigate('/students'), 1500);
        }
      } else {
        toast.error(`No students were uploaded. ${skipped + failed} were skipped/failed.`);
      }
    } catch (error) {
      setIsUploading(false);
      toast.error(`Upload failed: ${error?.message || 'Unknown error'}`);
      setFailedRows(skippedRows);
    }
  }, [displayedRows, isDuplicate, validateRowForUpload, buildStudentPayload, isUploading, uploadStudentsMutation, navigate]);

    return (
        <div className="min-h-full bg-[#F9FAFB] p-6">
      <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="mb-8">
                        <div className="flex gap-4 items-center">
                            <button
                                onClick={() => navigate('/students')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Back
                            </button>
              <h2 className="text-2xl font-bold text-gray-900">Add Students</h2>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
              Upload a .csv or .xlsx file. Max 100MB.
            </p>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
            onDrop={onDrop}
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center text-center hover:border-gray-400 transition-colors"
          >
            <UploadCloud className="w-10 h-10 text-indigo-500 mb-3" />
            <p className="text-indigo-700 font-medium">Import a file</p>
            <p className="text-sm text-gray-500">.csv, .xlsx up to 100MB</p>
            <div className="mt-4 flex gap-3">
              <button onClick={onBrowse} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">
                Choose file
              </button>
              {file && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span className="truncate max-w-[240px]">{file.name}</span>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onInputChange} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => setProceeded(true)}
              disabled={!rows.length}
              className="px-4 py-2 bg-[#23388F] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed
            </button>
          </div>

          {/* Preview Table */}
          {proceeded && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Student Table</h3>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOnlyDuplicates((v) => !v)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border ${showOnlyDuplicates ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {showOnlyDuplicates ? 'Showing Duplicates' : 'Show Duplicates'}
                    <span className={`ml-1 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs ${showOnlyDuplicates ? 'bg-white text-red-700' : 'bg-red-100 text-red-700'}`}>
                      {duplicatesInfo.count}
                    </span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REG. NO</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fullname</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Address</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year of Enrollment</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campus</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intake Period</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedRows.map((r) => {
                      const dup = isDuplicate(r);
                      const isEditing = editingRowId === r._row;
                      return (
                        <tr key={`${r._row}`} className={dup ? "bg-red-50" : ""}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.registrationNumber}
                                onChange={(e) => setEditDraft((d) => ({ ...d, registrationNumber: e.target.value }))}
                              />
                            ) : (
                              r.registrationNumber
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.fullname}
                                onChange={(e) => setEditDraft((d) => ({ ...d, fullname: e.target.value }))}
                              />
                            ) : (
                              r.fullname
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.email}
                                onChange={(e) => setEditDraft((d) => ({ ...d, email: e.target.value }))}
                              />
                            ) : (
                              r.email
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.gender}
                                onChange={(e) => setEditDraft((d) => ({ ...d, gender: e.target.value }))}
                              />
                            ) : (
                              r.gender
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.course}
                                onChange={(e) => setEditDraft((d) => ({ ...d, course: e.target.value }))}
                              />
                            ) : (
                              r.course
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.yearOfEnrollment}
                                onChange={(e) => setEditDraft((d) => ({ ...d, yearOfEnrollment: e.target.value }))}
                              />
                            ) : (
                              r.yearOfEnrollment
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.campus}
                                onChange={(e) => setEditDraft((d) => ({ ...d, campus: e.target.value }))}
                              />
                            ) : (
                              r.campus
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.school}
                                onChange={(e) => setEditDraft((d) => ({ ...d, school: e.target.value }))}
                              />
                            ) : (
                              r.school
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.department}
                                onChange={(e) => setEditDraft((d) => ({ ...d, department: e.target.value }))}
                              />
                            ) : (
                              r.department
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.age}
                                onChange={(e) => setEditDraft((d) => ({ ...d, age: e.target.value }))}
                              />
                            ) : (
                              r.age
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.phoneNumber}
                                onChange={(e) => setEditDraft((d) => ({ ...d, phoneNumber: e.target.value }))}
                              />
                            ) : (
                              r.phoneNumber
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {isEditing ? (
                              <input
                                className="w-full border rounded px-2 py-1 text-sm"
                                value={editDraft.intakePeriod}
                                onChange={(e) => setEditDraft((d) => ({ ...d, intakePeriod: e.target.value }))}
                              />
                            ) : (
                              r.intakePeriod
                            )}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <button onClick={saveEdit} className="px-2 py-1 bg-emerald-600 text-white rounded text-xs">Save</button>
                                <button onClick={cancelEdit} className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => startEdit(r)} className="px-2 py-1 text-white bg-[#23388F] rounded text-xs">Edit</button>
                                <button onClick={() => deleteRow(r._row)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing {displayedRows.length} of {rows.length} Results</div>
                <button
                  type="button"
                  disabled={isUploading || uploadStudentsMutation.isPending}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm ${(isUploading || uploadStudentsMutation.isPending) ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
                  onClick={uploadAllStudents}
                >
                  <Check className="w-4 h-4" /> {(isUploading || uploadStudentsMutation.isPending) ? 'Uploading...' : 'Upload'}
                </button>
              </div>
              {failedRows.length > 0 && (
                <div className="mt-4 text-sm">
                  <div className="font-medium text-red-700 mb-2">Failed Rows</div>
                  <div className="max-h-48 overflow-auto border rounded">
                    <table className="min-w-full text-sm">
                      <thead className="bg-red-50">
                        <tr>
                          <th className="px-3 py-2 text-left">REG. NO</th>
                          <th className="px-3 py-2 text-left">Fullname</th>
                          <th className="px-3 py-2 text-left">Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {failedRows.map((f, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-3 py-2">{f.row.registrationNumber}</td>
                            <td className="px-3 py-2">{f.row.fullname}</td>
                            <td className="px-3 py-2 text-red-600">{f.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentUpload