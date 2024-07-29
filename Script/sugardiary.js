document.addEventListener("DOMContentLoaded", function () {
    let toggleState = false;
    let originalButtonPosition = { bottom: "70px", right: "20px" };
    let mainToggleButton = document.getElementById("main-toggle-button");
    let menuButtons = document.getElementById("menu-buttons");
    let recordsContainer = document.getElementById("records-container");
    let recordButtons = document.querySelectorAll(
        "#exercise-button, #weight-record-button, #blood-pressure-button, #meal-sugar-button, #sugar-button"
    );
    let lastClickedButton = null;
    let currentYear = "";
    let currentMonth = "";
    let currentDay = "";


































    recordButtons.forEach((button) => (button.disabled = true));

    mainToggleButton.addEventListener("click", function () {
        toggleState = !toggleState;
        this.classList.toggle("rotate");

        if (toggleState) {
            menuButtons.classList.remove("hidden");
            document
                .querySelectorAll(".floating-button-container")
                .forEach((el) => el.classList.add("show"));
            document
                .querySelectorAll(".floating-button-text")
                .forEach((el) => (el.style.display = "block"));
            recordButtons.forEach((button) => (button.disabled = false));
        } else {
            document
                .querySelectorAll(".floating-button-container")
                .forEach((el) => el.classList.remove("show"));
            document
                .querySelectorAll(".floating-button-text")
                .forEach((el) => (el.style.display = "none"));
            setTimeout(function () {
                menuButtons.classList.add("hidden");
                recordButtons.forEach((button) => (button.disabled = true));
                recordsContainer.style.maxHeight = "calc(100vh - 100px)";
            }, 300);
        }
    });

    function addRecord(recordType, imgUrl, recordClass) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const timeString = `${hours}:${minutes}`;
        const valueString = "90mg/dl";

        const recordHtml = `
            <div class="record-title">
                <img src="${imgUrl}" alt="" style="width: 24px; height: 24px; margin-right: 8px;">
                <div id="record-title-text">${recordType}</div>
            </div>
            <div class="record-time">${timeString}</div>
            <i class="fas fa-times close-icon" onclick="removeRecord(event, this)" style="cursor: pointer;"></i>
            <div class="record-value">${valueString}</div>
        `;

        const divContainer = document.createElement("div");
        divContainer.classList.add("record-entry");
        divContainer.classList.add(recordClass);
        divContainer.innerHTML = recordHtml;
        recordsContainer.insertAdjacentElement("beforeend", divContainer);

        let link = "";
        if (recordClass == "exercise-record") {
            link = "/exercise";
        } else if (recordClass == "weight-record") {
            link = "";
        } else if (recordClass == "blood-pressure-record") {
            link = "";
        } else if (recordClass == "mealrecord-record") {
            link = "/mealrecord";
        } else if (recordClass == "sugar-record") {
            link = "/bs";
        }

        divContainer.addEventListener("click", () => {
            console.log(currentYear, currentMonth, currentDay);
            window.location.href = `${link}?date=${currentYear}-${currentMonth}-${currentDay}`;
        });

        // recordsContainer.insertAdjacentHTML("beforeend", recordHtml);
        recordsContainer.scrollTop = recordsContainer.scrollHeight;

        if (lastClickedButton) {
            lastClickedButton.style.bottom = originalButtonPosition.bottom;
            lastClickedButton.style.right = originalButtonPosition.right;
            lastClickedButton = null;
        }
        mainToggleButton.style.bottom = originalButtonPosition.bottom;
        mainToggleButton.style.right = originalButtonPosition.right;
    }

    window.removeRecord = function (e, element) {
        e.stopPropagation();
        element.parentElement.remove();
        recordsContainer.scrollTop = recordsContainer.scrollHeight;
    };

    function triggerMainToggleButton() {
        mainToggleButton.click();
    }

    document
        .getElementById("exercise-button")
        .addEventListener("click", function () {
            lastClickedButton = this;
            addRecord(
                "운동 기록",
                "https://res.cloudinary.com/difzc7bsf/image/upload/v1721719663/002_cuhgi9.png",
                "exercise-record"
            );
            triggerMainToggleButton();
        });

    document
        .getElementById("weight-record-button")
        .addEventListener("click", function () {
            lastClickedButton = this;
            addRecord(
                "체중 기록",
                "https://res.cloudinary.com/difzc7bsf/image/upload/v1721888337/image-removebg-preview_3_t28f17.png",
                "weight-record"
            );
            triggerMainToggleButton();
        });

    document
        .getElementById("blood-pressure-button")
        .addEventListener("click", function () {
            lastClickedButton = this;
            addRecord(
                "혈압 기록",
                "https://res.cloudinary.com/difzc7bsf/image/upload/v1721983336/%EC%A0%9C%EB%AA%A9%EC%9D%84-%EC%9E%85%EB%A0%A5%ED%95%B4%EC%A3%BC%EC%84%B8%EC%9A%94_-009_basbm8.png",
                "blood-pressure-record"
            );
            triggerMainToggleButton();
        });

    document
        .getElementById("meal-sugar-button")
        .addEventListener("click", function () {
            lastClickedButton = this;
            addRecord(
                "식사 기록",
                "https://res.cloudinary.com/difzc7bsf/image/upload/v1721885477/%EC%A0%9C%EB%AA%A9%EC%9D%84_%EC%9E%85%EB%A0%A5%ED%95%B4%EC%A3%BC%EC%84%B8%EC%9A%94_-005_tvsy8t.png",
                "mealrecord-record"
            );
            triggerMainToggleButton();
        });

    document
        .getElementById("sugar-button")
        .addEventListener("click", function () {
            lastClickedButton = this;
            addRecord(
                "혈당 기록",
                "https://res.cloudinary.com/difzc7bsf/image/upload/v1721719247/blood_h0b2io.png",
                "sugar-record"
            );
            triggerMainToggleButton();
        });

    // document.addEventListener("click", function (event) {
    //     if (event.target.classList.contains("exercise-record")) {
    //         window.location.href = "exercise";
    //     } else if (event.target.classList.contains("weight-record")) {
    //         window.location.href = "";
    //     } else if (event.target.classList.contains("blood-pressure-record")) {
    //         window.location.href = "";
    //     } else if (event.target.classList.contains("mealrecord-record")) {
    //         window.location.href = "mealrecord";
    //     } else if (event.target.classList.contains("sugar-record")) {
    //         window.location.href = "bs";
    //     }
    // });

    // 캘린더
    const calendar = document.getElementById("calendar");
    const calendarHeader = document.getElementById("calendar-header");
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    let currentDate = new Date(); // 현재 날짜로 초기화

    function updateHeader(date) {
        const options = { year: "numeric", month: "long" };
        calendarHeader.textContent = date.toLocaleDateString("ko-KR", options);
    }

    function generateCalendar(selectedDate) {
        calendar.innerHTML = ""; // 기존 캘린더 내용 제거

        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - Math.floor(7 / 2)); // 선택된 날짜를 중앙에 배치

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            const dayDiv = document.createElement("div");
            dayDiv.classList.add("day");
            if (date.toDateString() === selectedDate.toDateString()) {
                dayDiv.classList.add("selected");
            }
            dayDiv.innerHTML = `${date.getDate()}<br>${
                daysOfWeek[date.getDay()]
            }`;
            dayDiv.addEventListener("click", () => {
                generateCalendar(date); // 새로운 날짜 생성
                updateHeader(date); // 헤더 업데이트
                // 추가적인 기능이 필요한 경우 여기에 추가합니다.
            });
            calendar.appendChild(dayDiv);
        }
        updateHeader(selectedDate); // 선택된 날짜로 헤더 업데이트
        console.log("Year: ", selectedDate.getYear() + 1900);
        console.log("Month:", selectedDate.getMonth() + 1); // 0부터 시작하므로 +1
        console.log("Day:", selectedDate.getDate());

        currentYear = selectedDate.getYear() + 1900;
        currentMonth = (selectedDate.getMonth() + 1)
            .toString()
            .padStart(2, "0");
        currentDay = selectedDate.getDate().toString().padStart(2, "0");
    }

    // function getParameterByName(name) {
    //     const urlParams = new URLSearchParams(window.location.search);
    //     return urlParams.get(name);
    // }

    // const dateParam = getParameterByName("date");
    // if (dateParam) {
    //     currentDate = new Date(dateParam);
    // }
    generateCalendar(currentDate); // 초기화
});
