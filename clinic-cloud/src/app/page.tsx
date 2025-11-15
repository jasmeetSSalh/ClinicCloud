'use client';

import { useState, useEffect } from "react";

interface Table {
  name: string;
}

interface TableData {
  [key: string]: any;
}

export default function Home() {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);


  const [createOn, setCreateOn] = useState(false);
  const [createDisable, setCreateDisable] = useState(false);
  const [createResultMsg, setCreateResultMsg] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState<boolean | null>(null);

  const [selectedEntryKey, setSelectedEntryKey] = useState<number | null>(null);
  const [selectedEntryObject, setSelectedEntryObject] = useState<Record<string,any> | null>(null);

  const [deleteOn, setDeleteOn] = useState(false);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tables');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tables');
      }
      
      setTables(data.tables);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

const deleteAllTables = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/tables', {
      method: 'DELETE'
    });
    const responseMessage = await response.json();

    if (!response.ok) {
      throw new Error(responseMessage.error || 'Failed to delete tables');
    }
    fetchTables();
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}

const createAllTables = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/tables', {
      method: 'POST'
    });
    const responseMessage = await response.json();

    if (!response.ok) {
      throw new Error(responseMessage.error || 'Failed to create tables');
    }
    fetchTables();
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}

const populateAllTables = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/tables', {
      method: 'PUT'
    });
    const responseMessage = await response.json();

    if (!response.ok) {
      throw new Error(responseMessage.error || 'Failed to populate tables');
    }
    fetchTables();
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
}

const fetchTableData = async (tableName: string) => {
  try {
    setModalLoading(true);
    setModalError(null);
    const response = await fetch(`/api/tables/${tableName}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch table data');
    }
    
    setTableData(data.data || []);
  } catch (err) {
    setModalError(err instanceof Error ? err.message : 'An error occurred');
    setTableData([]);
  } finally {
    setModalLoading(false);
  }
};

const handleTableClick = (tableName: string) => {
  setSelectedTable(tableName.toLowerCase());
  fetchTableData(tableName.toLowerCase());
};

const closeModal = () => {
  setSelectedTable(null);
  setTableData([]);
  setModalError(null);
  setCreateOn(false);
  setCreateDisable(false);
  setCreateResultMsg("");
  setCreateSuccess(null);
  setCreateLoading(false);

  setSelectedEntryKey(null);
  setDeleteOn(false);
};

async function handleSubmit(event: React.FormEvent<HTMLFormElement>, tableName: string) {
  event.preventDefault();

  setCreateDisable(true);
  setCreateLoading(true);
  const data = new FormData(event.currentTarget);
  const formObject = Object.fromEntries(data.entries());

  console.log("Sending:");
  console.log(formObject);
  console.log("Table:", tableName);

  const res = await fetch(`/api/tables/${tableName}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tableName: tableName,
      tableData: formObject
    })
  });
  const result = await res.json();


  if (res.ok){
    console.log("post successful");
    setCreateSuccess(true);
    setCreateResultMsg(result.message);

    await fetchTableData(tableName);

  } else {
    console.log("something went wrong");    
    console.log(result);
    setCreateResultMsg(result.message.code);
    setCreateSuccess(false);
  }
  setCreateDisable(false);
  setCreateLoading(false);

}

function selectEntry(event: React.MouseEvent<HTMLElement>, index: number){
  console.log(event.currentTarget)
  if(selectedEntryKey !== index){
    let selectedEntryElement = event.currentTarget;

    let tableColumns = Object.keys(tableData[0]);
    let entryObject: Record<string, any> = {};

    [...selectedEntryElement.children].forEach((element, index) => {
      console.log(element.textContent);
      entryObject[tableColumns[index]] = element.textContent;

    });

    console.log(selectedEntryElement);
    console.log(tableColumns);
    console.log(entryObject);

    setSelectedEntryKey(index);
    setSelectedEntryObject(entryObject);
  } else {
    setSelectedEntryKey(null);
  }

}

function deleteEntry(){

  setDeleteOn(!deleteOn)
  console.log(selectedEntryKey);
  console.log(Object.keys(tableData[0]));
}


  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">
            Oracle Database Tables
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Connected to Oracle Database - Showing all available tables
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Database Tables
            </h2>
            <div className="flex gap-2">
              <button
                onClick={fetchTables}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={deleteAllTables}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Executing...' : 'Delete All Tables'}
              </button>
              <button
                onClick={createAllTables}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating All Tables...' : 'Create All Tables'}
              </button>
              <button
                onClick={populateAllTables}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Populating...' : 'Populate All Tables'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-600 dark:text-red-300">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
              <p className="text-sm mt-2">
                Please check your Oracle database connection settings in .env.local
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading tables...</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tables.length > 0 ? (
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
                    <h3 className="font-medium text-black dark:text-white">
                      Found {tables.length} table{tables.length !== 1 ? 's' : ''}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tables.map((table, index) => (
                        <div
                          key={index}
                          onClick={() => handleTableClick(table)}
                          className="p-3 bg-zinc-50 dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                        >
                          <p className="font-mono text-sm text-black dark:text-white">
                            {table}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <p className="text-zinc-600 dark:text-zinc-400">
                      No tables found in the connected Oracle database.
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-black dark:text-white">
                {selectedTable} Data
              </h2>
              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex justify-end gap-4 px-4 py-4">
              <button 
                onClick={()=>{setCreateOn(!createOn); setCreateSuccess(null)}}
                disabled={createDisable}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {createOn ? "Cancel New Entry" : "Create New Entry"}
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Edit Entry
              </button>
              <button 
                onClick={()=>deleteEntry()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:cursor-pointer hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Delete Entry
              </button>
            </div>

            {createOn && Array.isArray(tableData) && tableData.length > 0 && (
              <div className="flex justify-center py-4">
                <form onSubmit={(event)=>handleSubmit(event, selectedTable)} className="flex-1 flex flex-col gap-4 justify-center px-4 w-full">
                  <div className="overflow-x-auto">
                    <table className="table-auto w-full border-collapse">
                      <thead className="bg-zinc-50 dark:bg-zinc-700 sticky top-0 border-l border-r border-zinc-50 dark:border-zinc-700">
                        <tr>
                          {Object.keys(tableData[0] || {}).map((column) => (
                            <th
                              key={column}
                              className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-600"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-zinc-800">
                        <tr>
                          {Object.keys(tableData[0] || {}).map((column,index) => (
                            <td
                              key={column}
                              className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 border-b border-l border-r border-zinc-200 dark:border-zinc-600"
                            >
                              {column.includes("DATE")?  <input name={column} type="date" autoFocus={index==0} className="w-full border-none outline-none bg-transparent" /> : <input name={column} autoFocus={index==0} className="w-full border-none outline-none bg-transparent" />}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>                    
                  </div>


                  <input disabled={createDisable} type="submit" className="w-1/10 px-4 py-2 bg-green-600 text-white rounded-lg hover:cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"/>
                  {createLoading ? <p>Loading</p> : 
                    createSuccess !== null && (
                      createSuccess ? (
                        <p className="text-green-500">Insert Successful</p>
                      ) : (
                        <p className="text-red-500">Error Inserting: {createResultMsg}</p>
                      )
                    )
                  }
                </form>
              </div>
            )}

            {

            }


            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading table data...</p>
                </div>
              ) : modalError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 dark:text-red-400">{modalError}</p>
                </div>
              ) : tableData.length > 0 ? (
                <div className="overflow-auto max-h-full">
                  <table className="min-w-full border border-zinc-200 dark:border-zinc-700">
                    <thead className="bg-zinc-50 dark:bg-zinc-700 sticky top-0">
                      <tr>
                        {Object.keys(tableData[0]).map((column) => (
                          <th
                            key={column}
                            className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-600"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-800">
                      {tableData.map((row, index) => (
                        <tr key={index} onClick={(event)=>selectEntry(event, index)} className={`${selectedEntryKey === index ? "bg-zinc-900" : "bg-none"}  hover:cursor-pointer hover:bg-zinc-700 group active:bg-zinc-500`}>
                          {Object.values(row).map((value, valueIndex) => (
                            <td
                              key={valueIndex}
                              className="group-active:bg-zinc-500 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-600"
                            >
                              {value !== null && value !== undefined 
                                ? String(value) 
                                : <span className="text-zinc-400 italic">NULL</span>
                              }
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-zinc-600 dark:text-zinc-400">No data found in this table.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col px-4 pb-2">
              <p>To Create a New Entry - click on Create New Entry, fill out the fields, press submit</p>
              <p>To Edit an Entry - click on an entry, click on Edit Entry, change the desired fields, press submit</p>
              <p>To Delete an Entry - click on an entry, click on Delete Entry, confirm your decision</p>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {tableData.length > 0 && `${tableData.length} row${tableData.length !== 1 ? 's' : ''} found`}
              </p>
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
