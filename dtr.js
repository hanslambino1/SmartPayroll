document.addEventListener("DOMContentLoaded", () => {
  const DATE_COL = 1;
  const TIME_IN_COL = 2;
  const TIME_OUT_COL = 3;
  const UNDERTIME_COL = 4;
  const OVERTIME_COL = 5;
  const LATE_COL = 6;

  document.querySelectorAll("table td[contenteditable='true']").forEach(cell => {
    // Callendar
    if (cell.cellIndex === DATE_COL) {
      cell.addEventListener("focus", () => {
        if (cell.querySelector("input[type='date']")) return;

        let oldValue = cell.textContent.trim();
        const input = document.createElement("input");
        input.type = "date";
        input.value = oldValue ? formatToISO(oldValue) : "";

        cell.textContent = "";
        cell.appendChild(input);
        input.focus();

        input.addEventListener("blur", () => {
          if (input.value) {
            let [year, month, day] = input.value.split("-");
            cell.textContent = `${month}/${day}/${year.slice(-2)}`;
          } else {
            cell.textContent = oldValue;
          }
        });
      });
    }

    // Time In / Time Out
    if (cell.cellIndex === TIME_IN_COL || cell.cellIndex === TIME_OUT_COL) {
      cell.addEventListener("focus", () => {
        if (cell.querySelector("select")) return;

        let rawTime = cell.textContent.replace(/am|pm/gi, "").trim();

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";

        const input = document.createElement("input");
        input.type = "time";
        input.value = convertTo24Hour(rawTime, cell.textContent);

        const select = document.createElement("select");
        select.add(new Option("AM", "am"));
        select.add(new Option("PM", "pm"));
        if (/pm/i.test(cell.textContent)) {
          select.value = "pm";
        } else {
          select.value = "am";
        }

        wrapper.appendChild(input);
        wrapper.appendChild(select);

        cell.textContent = "";
        cell.appendChild(wrapper);
        input.focus();

        const save = () => {
          setTimeout(() => {
            if (!cell.contains(document.activeElement)) {
              let timeVal = input.value ? formatTo12Hour(input.value, select.value) : rawTime;
              cell.textContent = timeVal;
            }
          }, 100);
        };
        input.addEventListener("blur", save);
        select.addEventListener("blur", save);
      });
    }

    // Undertime, Overtime, Late (with number + unit dropdown)
    if ([UNDERTIME_COL, OVERTIME_COL, LATE_COL].includes(cell.cellIndex)) {
      cell.addEventListener("focus", () => {
        if (cell.querySelector("select")) return;

        let oldValue = cell.textContent.trim();
        let numPart = oldValue.replace(/\D/g, "");
        let unitPart = /hour/i.test(oldValue) ? "hours" : "minutes";

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.value = numPart || "";

        const select = document.createElement("select");
        select.add(new Option("Minutes", "minutes"));
        select.add(new Option("Hours", "hours"));
        select.value = unitPart;

        wrapper.appendChild(input);
        wrapper.appendChild(select);

        cell.textContent = "";
        cell.appendChild(wrapper);
        input.focus();

        const save = () => {
          setTimeout(() => {
            if (!cell.contains(document.activeElement)) {
              cell.textContent = input.value ? `${input.value} ${select.value}` : oldValue;
            }
          }, 100);
        };
        input.addEventListener("blur", save);
        select.addEventListener("blur", save);
      });
    }
  });

  // Helpers
  function formatToISO(dateStr) {
    let parts = dateStr.split("/");
    if (parts.length === 3) {
      let [month, day, year] = parts;
      year = year.length === 2 ? "20" + year : year;
      return `${year}-${month.padStart(2,"0")}-${day.padStart(2,"0")}`;
    }
    return "";
  }

  function convertTo24Hour(timeStr, fullText) {
    if (!timeStr) return "";
    let [hh, mm] = timeStr.split(":");
    let ampm = /pm/i.test(fullText) ? "pm" : "am";
    hh = parseInt(hh, 10);

    if (ampm === "pm" && hh < 12) hh += 12;
    if (ampm === "am" && hh === 12) hh = 0;

    return `${String(hh).padStart(2,"0")}:${mm || "00"}`;
  }

  function formatTo12Hour(time24, ampm) {
    if (!time24) return "";
    let [hh, mm] = time24.split(":");
    hh = parseInt(hh, 10);
    let suffix = ampm;

    if (hh === 0) {
      hh = 12; suffix = "am";
    } else if (hh > 12) {
      hh = hh - 12; suffix = "pm";
    }
    return `${hh}:${mm} ${suffix}`;
  }
});
