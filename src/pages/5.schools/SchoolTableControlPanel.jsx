import { IoFilterSharp, IoSearch } from 'react-icons/io5';
import { HiOutlineDocumentDuplicate, HiX, HiMinusSm, HiOutlineDocumentReport, HiChevronRight, HiInformationCircle } from 'react-icons/hi';
import { useState, useMemo } from 'react';

const ModifyTableDialog = ({ isOpen, onClose, columnVisibility, setColumnVisibility }) => {
  if (!isOpen) return null;

  const handleToggleColumn = (columnId) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px" }}>
        <div className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border">
          <h2 className="text-lg font-semibold text-gray-900">Modify Table</h2>
          <button
            onClick={onClose}
            className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
            style={{ width: "148px", height: "36px", gap: "8px" }}
          >
            <HiX className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">Close Window</span>
          </button>
        </div>

        <div className="p-7 border rounded mb-9 mx-7">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900">Select Data Fields to Display</h3>
            <p className="text-sm text-gray-500">please select the fields in the table</p>
          </div>

          <div className="space-y-3">
            {Object.entries(columnVisibility).map(([columnId, isVisible]) => (
              <div key={columnId} className="flex items-center">
                <button
                  onClick={() => handleToggleColumn(columnId)}
                  className={`flex items-center justify-center w-4 h-4 rounded p-[2.5px] ${
                    isVisible ? "bg-accent2-600" : "bg-gray-200"
                  }`}
                >
                  {isVisible && <HiMinusSm className="w-3 h-3 text-white font-bold" />}
                </button>
                <span className="ml-3 text-gray-700">
                  {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-900"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsPanel = ({ row, onClose }) => {
  let parsedDetails = null;
  let rawDetails = null;

  if (row.details) {
    try {
      parsedDetails = JSON.parse(row.details);
    } catch (e) {
      rawDetails = row.details;
    }
  }

  return (
    <div className="w-80 flex-shrink-0 border-l bg-gray-50 flex flex-col h-full">
      <div className="flex justify-between items-center px-4 py-3 border-b bg-white">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <HiInformationCircle className="text-blue-500 w-4 h-4" />
          Activity Details
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <HiX className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-4 space-y-4 text-xs">
        <div className="space-y-2">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">User</p>
          <p className="text-gray-900 font-medium">{row.user}</p>
          <p className="text-gray-500">{row.role}</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">Action</p>
          <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{row.action}</span>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">Timestamp</p>
          <p className="text-gray-900">{row.date}</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">IP Address</p>
          <p className="text-gray-900 font-mono">{row.ipAddress}</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">Device ID</p>
          <p className="text-gray-900 font-mono break-all">{row.deviceId}</p>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-gray-500 uppercase tracking-wide">Browser Agent</p>
          <p className="text-gray-700 break-words">{row.browserAgent}</p>
        </div>

        {/* Changes / Details Section */}
        {parsedDetails && (
          <div className="space-y-2">
            <p className="font-semibold text-gray-500 uppercase tracking-wide">Changes Recorded</p>
            {parsedDetails.changes && Array.isArray(parsedDetails.changes) && parsedDetails.changes.length > 0 ? (
              <div className="space-y-2">
                {parsedDetails.changes.map((change, i) => (
                  <div key={i} className="bg-white border rounded p-2 space-y-1">
                    <p className="font-semibold text-gray-700 capitalize">{change.field}</p>
                    <div className="flex items-center gap-1">
                      <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs line-through">{change.oldValue ?? '—'}</span>
                      <HiChevronRight className="text-gray-400 w-3 h-3 flex-shrink-0" />
                      <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">{change.newValue ?? '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border rounded p-3">
                <pre className="whitespace-pre-wrap break-all text-gray-600">{JSON.stringify(parsedDetails, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {rawDetails && (
          <div className="space-y-1">
            <p className="font-semibold text-gray-500 uppercase tracking-wide">Details</p>
            <div className="bg-white border rounded p-2">
              <p className="text-gray-700 break-words">{rawDetails}</p>
            </div>
          </div>
        )}

        {!parsedDetails && !rawDetails && (
          <div className="text-gray-400 text-center py-4">No additional details recorded for this action.</div>
        )}
      </div>
    </div>
  );
};

const UsageReportModal = ({ isOpen, onClose, auditData, onDownloadCsv }) => {
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);

  const filteredData = useMemo(() => {
    if (!auditData) return [];
    const q = search.toLowerCase();
    if (!q) return auditData;
    return auditData.filter(row =>
      row.user?.toLowerCase().includes(q) ||
      row.role?.toLowerCase().includes(q) ||
      row.action?.toLowerCase().includes(q) ||
      row.date?.toLowerCase().includes(q) ||
      row.ipAddress?.toLowerCase().includes(q)
    );
  }, [auditData, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full flex flex-col" style={{ maxWidth: '95vw', maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-bold text-gray-900">System Usage &amp; Audit Logs</h2>
            <p className="text-xs text-gray-500 mt-0.5">{filteredData.length} record{filteredData.length !== 1 ? 's' : ''} {search ? 'matched' : 'total'}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by user, action, IP..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72"
              />
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filteredData && filteredData.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Browser</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Device ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredData.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedRow(selectedRow === idx ? null : idx)}
                      className={`cursor-pointer transition-colors ${selectedRow === idx ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{row.user}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <span className="inline-block bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">{row.role}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[180px] truncate" title={row.action}>{row.action}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{row.date}</td>
                      <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate text-xs" title={row.browserAgent}>{row.browserAgent}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs">{row.ipAddress}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs max-w-[100px] truncate" title={row.deviceId}>{row.deviceId}</td>
                      <td className="px-4 py-3">
                        {row.details ? (
                          <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-medium">
                            <HiInformationCircle className="w-3.5 h-3.5" /> View
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center py-16 text-gray-400">
                  <HiOutlineDocumentReport className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">{search ? 'No records match your search' : 'No audit logs available'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Side Details Panel */}
          {selectedRow !== null && filteredData[selectedRow] && (
            <DetailsPanel row={filteredData[selectedRow]} onClose={() => setSelectedRow(null)} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
          <p className="text-xs text-gray-400">Click any row to view full activity details</p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
            <button
              onClick={onDownloadCsv}
              disabled={!auditData || auditData.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <HiOutlineDocumentReport className="w-4 h-4" />
              Download CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchoolTableControlPanel = ({ onModifyTable, onGenerateReport }) => {
  return (
    <div className="px-6 py-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-900">Table Control Panel</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={onGenerateReport}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Generate Usage Report
              <HiOutlineDocumentReport className="ml-2" />
            </button>
            <button 
              onClick={onModifyTable}
              className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
            >
              Modify Table
              <HiOutlineDocumentDuplicate className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SchoolTableControlPanel, ModifyTableDialog, UsageReportModal };
