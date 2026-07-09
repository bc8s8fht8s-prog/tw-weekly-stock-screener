const pageSize = 50;

let data = {};
let currentPage = 1;

// 所有股票
let allStocks = [];

// 搜尋後股票
let filteredStocks = [];

async function loadData() {

    const response = await fetch("docs/data/result.json");

    data = await response.json();

    allStocks = data.stocks;
    filteredStocks = [...allStocks];

    document.getElementById("update_time").textContent = data.update_time;
    document.getElementById("scan_count").textContent = data.scan_count;
    document.getElementById("count").textContent = data.count + " 檔";

    renderPage(1);

}

function renderPage(page) {

    currentPage = page;

    const stockList = document.getElementById("stock-list");

    stockList.innerHTML = "";

    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const stocks = filteredStocks.slice(start, end);

    // 沒有搜尋結果
    if (stocks.length === 0) {

        stockList.innerHTML = `
            <div class="no-result">
                🔍 找不到符合條件的股票
            </div>
        `;

        document.getElementById("pagination").innerHTML = "";

        return;

    }

    stocks.forEach(stock => {

        const close =
            stock.close != null
                ? Number(stock.close).toFixed(2)
                : "--";

        const high =
            stock.high != null
                ? Number(stock.high).toFixed(2)
                : "--";

        const change =
            stock.change_percent != null
                ? Number(stock.change_percent).toFixed(2)
                : "--";

        const osc =
            stock.osc != null
                ? Number(stock.osc).toFixed(3)
                : "--";

        // OSC 顏色
        let oscClass = "osc-neutral";

        if (stock.osc > 0) {

            oscClass = "osc-up";

        } else if (stock.osc < 0) {

            oscClass = "osc-down";

        }

        stockList.innerHTML += `

            <div class="stock-card">

                <h3>${stock.code} ${stock.name}</h3>

                <p>
                    本週收盤：
                    <strong>${close}</strong>
                </p>

                <p>
                    上週最高：
                    <strong>${high}</strong>
                </p>

                <p>
                    本週漲幅：
                    <span class="osc-up">
                        ${change}%
                    </span>
                </p>

                <p>
                    週OSC：
                    <span class="${oscClass}">
                        ${osc}
                    </span>
                </p>

            </div>

        `;

    });

    renderPagination();

}

function renderPagination() {

    const totalPages = Math.ceil(filteredStocks.length / pageSize);

    let html = "";

    // 上一頁
    if (currentPage > 1) {

        html += `
            <button class="page-btn"
                onclick="renderPage(${currentPage - 1})">
                ◀
            </button>
        `;

    }

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        endPage = Math.min(5, totalPages);
    }

    if (currentPage >= totalPages - 2) {
        startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {

        if (i === currentPage) {

            html += `
                <button class="page-btn active">
                    ${i}
                </button>
            `;

        } else {

            html += `
                <button
                    class="page-btn"
                    onclick="renderPage(${i})">
                    ${i}
                </button>
            `;

        }

    }

    // 下一頁
    if (currentPage < totalPages) {

        html += `
            <button class="page-btn"
                onclick="renderPage(${currentPage + 1})">
                ▶
            </button>
        `;

    }

    document.getElementById("pagination").innerHTML = `
        <div class="pagination">
            ${html}
        </div>
    `;

}

function searchStocks() {

    const keyword = document
        .getElementById("search")
        .value
        .trim()
        .toLowerCase();

    if (keyword === "") {

        filteredStocks = [...allStocks];

    } else {

        filteredStocks = allStocks.filter(stock => {

            const code = String(stock.code).toLowerCase();
            const name = String(stock.name).toLowerCase();

            return (
                code.includes(keyword) ||
                name.includes(keyword)
            );

        });

    }

    currentPage = 1;

    renderPage(1);

}

loadData();