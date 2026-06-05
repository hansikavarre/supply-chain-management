const baseURL = "http://127.0.0.1:5000";
let interval = null;

let chart;
let labels = [];
let supplierData = [];
let warehouseData = [];
let retailerData = [];

function initChart() {
    const ctx = document.getElementById("chart").getContext("2d");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Supplier", data: supplierData, borderWidth: 2 },
                { label: "Warehouse", data: warehouseData, borderWidth: 2 },
                { label: "Retailer", data: retailerData, borderWidth: 2 }
            ]
        }
    });
}

async function fetchStatus() {
    const res = await fetch(baseURL + "/status");
    const data = await res.json();

    document.getElementById("supplier").innerText = data.supplier;
    document.getElementById("warehouse").innerText = data.warehouse;
    document.getElementById("retailer").innerText = data.retailer;

    // prediction
    if (data.demand_history.length > 0) {
        let last = data.demand_history.slice(-5);
        let avg = Math.floor(last.reduce((a,b)=>a+b,0)/last.length);
        document.getElementById("prediction").innerText = avg;
    }

    // update graph
    labels.push(labels.length);
    supplierData.push(data.supplier);
    warehouseData.push(data.warehouse);
    retailerData.push(data.retailer);
    chart.update();

    // alerts
    let alertsList = document.getElementById("alerts");
    alertsList.innerHTML = "";
    data.alerts.slice(-5).forEach(a => {
        let li = document.createElement("li");
        li.innerText = a;
        alertsList.appendChild(li);
    });

    // history
    let historyList = document.getElementById("history");
    historyList.innerHTML = "";
    data.history.slice(-8).forEach(h => {
        let li = document.createElement("li");
        li.innerText = `${h.time} - ${h.event}`;
        historyList.appendChild(li);
    });
}

async function runSimulation() {
    await fetch(baseURL + "/simulate", { method: "POST" });
    fetchStatus();
}

function startAuto() {
    if (!interval) {
        interval = setInterval(runSimulation, 2000);
    }
}

function stopAuto() {
    clearInterval(interval);
    interval = null;
}

initChart();
fetchStatus();