import React, { useState, useEffect } from "react";
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css";
import { ReactTabulator } from "react-tabulator";
import "./tasklist.css";

function TaskList() {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const [task, setTask] = useState({
        title: "",
        description: "",
        status: "to do",
    });

    const [taskCounts, setTaskCounts] = useState({
        toDo: 0,
        inProgress: 0,
        done: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://jsonplaceholder.typicode.com/todos");
                const data = await response.json();
                const formattedData = data.map((item) => ({
                    ...item,
                    completed: item.completed ? "done" : "to do",
                }));
                setAllData(formattedData);
                setFilteredData(formattedData);
                updateTaskCounts(formattedData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    const updateTaskCounts = (data) => {
        const counts = {
            toDo: 0,
            inProgress: 0,
            done: 0,
        };
        data.forEach((item) => {
            if (item.completed === "to do") counts.toDo++;
            else if (item.completed === "in progress") counts.inProgress++;
            else if (item.completed === "done") counts.done++;
        });
        setTaskCounts(counts);
    };

    const applyFilters = () => {
        let filtered = allData;

        if (searchQuery) {
            filtered = filtered.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter((item) => item.completed === statusFilter);
        }

        setFilteredData(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [searchQuery, statusFilter]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTask((prevTask) => ({
            ...prevTask,
            [name]: value,
        }));
    };

    const handleAddTask = (e) => {
        e.preventDefault();

        const newTask = {
            id: allData.length + 1,
            title: task.title,
            description: task.description,
            completed: task.status,
        };

        const updatedData = [newTask, ...allData];
        setAllData(updatedData);
        setFilteredData(updatedData);
        updateTaskCounts(updatedData);

        setTask({ title: "", description: "", status: "to do" });
        setShowForm(false);
        setShowToast(true);
        setToastMessage("Task Created Successfully");

        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleDeleteRow = (row) => {
        const rowData = row.getData();
        const updatedData = allData.filter((item) => item.id !== rowData.id);
        setAllData(updatedData);
        setFilteredData(updatedData);
        updateTaskCounts(updatedData);
        setToastMessage("Task Deleted")
        setShowToast(true)
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const options = {
        pagination: "local",
        paginationSize: 20,
        paginationSizeSelector: [10, 20, 50, 100],
    };

    const columns = [
        {
            title: "Task Id", field: "id", headerSort: false, hozAlign: "center", width: 150
        },
        { title: "Title", field: "title", hozAlign: "left", editor: "input", headerSort: false, },
        {
            title: "Status",
            field: "completed",
            hozAlign: "center",
            width: 130,
            headerSort: false,
            editor: function (cell) {
                const select = document.createElement("select");
                const options = [
                    { value: "to do", text: "To Do" },
                    { value: "in progress", text: "In Progress" },
                    { value: "done", text: "Done" },
                ];
                options.forEach((option) => {
                    const optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.textContent = option.text;
                    select.appendChild(optionElement);
                });
                select.value = cell.getValue();
                select.addEventListener("change", function () {
                    const updatedData = allData.map((item) =>
                        item.id === cell.getData().id ? { ...item, completed: select.value } : item
                    );
                    setAllData(updatedData);
                    setFilteredData(updatedData);
                    updateTaskCounts(updatedData);
                    cell.setValue(select.value);
                    setToastMessage("Status Edited Successfully")
                    setShowToast(true)

                    setTimeout(() => {
                        setShowToast(false)

                    }, 3000);
                });
                return select;
            },
        },
        {
            title: "Action",
            headerSort: false,
            formatter: () => `<button class="delete-button">Delete</button>`,
            cellClick: (e, cell) => handleDeleteRow(cell.getRow()),
            hozAlign: "center",
            width: 200
        },
    ];


    function closeForm() {
        setShowForm(false)
    }

    function closeToast() {
        setShowToast(false)
    }

    return (


        <div className="container">
            {showToast && (
                <div className="toast">
                    <p>{toastMessage}</p>

                    <button className="addTaskBtn" onClick={closeToast}>Ok</button>
                </div>
            )}


            <h1>Task List Manager </h1>

            {showForm && (
                <div className="formPopup">
                    <div className="formContainer">
                        <button className="cancelBtn" onClick={closeForm}>X</button>

                        <form onSubmit={handleAddTask} style={{ marginBottom: "20px" }}>
                            <h2>Task Form</h2>
                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ display: "block", marginBottom: "5px" }}>Task Title:</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={task.title}
                                    onChange={handleInputChange}
                                    required
                                    className="dataInputStyle"
                                />
                            </div>

                            <div style={{ marginBottom: "10px" }}>
                                <label style={{ display: "block", marginBottom: "5px" }}>Status:</label>
                                <select
                                    name="status"
                                    value={task.status}
                                    onChange={handleInputChange}
                                    className="dataInputStyle"
                                >
                                    <option value="to do">To Do</option>
                                    <option value="in progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="addTaskBtn"
                            >
                                Submit Task
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px", alignItems: "center" }}>
                <div>
                    <h1>
                        Task Counter:
                    </h1>
                </div>
                <div><b>To Do:</b> {taskCounts.toDo}</div>
                <div><b>In Progress:</b> {taskCounts.inProgress}</div>
                <div><b>Done:</b> {taskCounts.done}</div>
            </div>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <input
                    type="text"
                    placeholder="Search by Title"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                    }}
                >
                    <option value="">Filter by Status</option>
                    <option value="to do">To Do</option>
                    <option value="in progress">In Progress</option>
                    <option value="done">Done</option>
                </select>

                <div style={{ marginBottom: "20px" }}>
                    <button
                        onClick={() => setShowForm((prev) => !prev)}
                        className="addTaskBtn"
                    >
                        Add Task
                    </button>
                </div>
            </div>

            <div >
                <ReactTabulator columns={columns} data={filteredData} options={options} />
            </div>
        </div>
    );
}

export default TaskList;
