//const dayEx = document.getElementById('dayEx');
const dayContainerEx = document.getElementById('dayContainerEx');
const dayEx = document.getElementById('dayFullEx');
const allDayLiEx = document.getElementById('allDayLiEx');
const calendar = document.getElementById('calendar');
const monthNameEx = document.getElementById('monthNameEx');
const timedScheduleLiEx = document.getElementById('timedScheduleLiEx');
const allDayScheduleLiEx = document.getElementById('allDayScheduleLiEx');
const calendarContainer = document.getElementById('calendarContainer');
const timedLiEx = document.getElementById("timedLiEx");
const renderDateData = {};
let selectedDateData = null;
// Example schedule data
const scheduleData = {};
let observer = null;
const EVENT_HEIGHT = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--event-height'));
// Object to manage events
const events = {};
let isScrollingToTop = false;
document.body.style.overflow = "hidden";
window.addEventListener('scroll', () => {
    if (isScrollingToTop) return; // 무시
    // 다른 스크롤 동작 처리
});
const scrollToTop=function() {
    isScrollingToTop = true;

    setTimeout(() => {
        isScrollingToTop = false; // 스크롤 완료 후 상태 초기화
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });

    }, 1000); // 스크롤 애니메이션 시간과 일치
}
scrollToTop();

function createKeyframes(animationName, keyframes) {
    // 스타일 요소 생성
    let styleSheet = document.querySelector('#dynamic-keyframes');
    if (!styleSheet) {
        styleSheet = document.createElement('style');
        styleSheet.id = 'dynamic-keyframes';
        document.head.appendChild(styleSheet);
    }

    // Keyframes 문자열 생성
    const keyframesRules = Object.entries(keyframes)
        .map(([percentage, rules]) => {
            const rule = Object.entries(rules)
                .map(([prop, value]) => `${prop}: ${value};`)
                .join(' ');
            return `${percentage} { ${rule} }`;
        })
        .join(' ');

    // Keyframes 추가
    styleSheet.sheet.insertRule(`@keyframes ${animationName} { ${keyframesRules} }`, styleSheet.sheet.cssRules.length);
}

const timedLiSetTopHeight = (startTime,endTime) => {
    let startHours,startMinutes,endHours,endMinutes;
    [startHours, startMinutes] = startTime.split(":").map(Number);
    [endHours, endMinutes] = endTime.split(":").map(Number);

    let startDecimal = startHours + startMinutes / 60;
    let endDecimal = endHours + endMinutes / 60;
    let top=startDecimal*EVENT_HEIGHT+"em"
    let height=(endDecimal-startDecimal)*EVENT_HEIGHT+"em"
    return [top,height]
}

class TimedFormData{
    constructor(form) {
        this.eventName = form.eventName.value;
        this.eventColor = form.eventColor.value;
        this.eventIcon = form.eventIcon.value;
        this.startTime = form.startTime.value;
        this.endTime = form.endTime.value;
        this.timeRange = `${this.startTime}-${this.endTime}`;
    }
    getEventNode(){
        const node = timedLiEx.cloneNode(true);
        node.removeAttribute("id");
        const time = node.querySelector(".time");
        const title = node.querySelector(".title");
        const icon = node.querySelector(".icon");
        node.dataset.time = this.timeRange;
        node.classList.add(this.eventColor);
        [node.style.top,node.style.height]=timedLiSetTopHeight(this.startTime,this.endTime)
        title.innerText = this.eventName;
        icon.innerText = this.eventIcon;
        time.innerText = this.timeRange;
        return node;
    };
}
// Add new event
const closeBtnHandler=function(e,dayNode){
    e.preventDefault();
    const dayFull = dayNode.querySelector(".day-full")
    dayFull.classList.remove('full')
    dayFull.classList.add('none')

}
const timedFormSubmitHandler=(e,timeline)=>{
    e.preventDefault();
    const timedForm=e.target;
    const formData = new TimedFormData(timedForm);
    const eventNode = formData.getEventNode();

    // 동일한 시간에 이벤트가 존재하는지 검사
    // for (const [key, value] of Object.entries(events)) {
    //     const [existingStart, existingEnd] = key.split(" - ").map((time) => {
    //         const [hours, minutes] = time.split(":").map(Number);
    //         return hours + minutes / 60;
    //     });
    //
    //     if (
    //         (formData.startDecimal < existingEnd && formData.startDecimal > existingStart) ||
    //         (formData.endDecimal > existingStart && formData.endDecimal < existingEnd) ||
    //         (formData.startDecimal <= existingStart && formData.endDecimal >= existingEnd) ||
    //         (formData.startDecimal >= existingStart && formData.endDecimal <= existingEnd)
    //     ) {
    //         const replace = confirm(`"${value.eventName}"와 겹칩니다. 대체하시겠습니까?`);
    //         if (!replace) {
    //             return; // Cancel adding the event
    //         }
    //         // Remove the overlapping event
    //         timeline.removeChild(value.node);
    //         delete events[key];
    //         break;
    //     }
    // }

    // Add new event to the timeline and events object
    timeline.appendChild(eventNode);
    events[formData.timeRange] = { ...formData, node: eventNode };
};
const setNewEventForm=function(dayNode,key){
    const timedForm=dayNode.querySelector(".timed-form");
    const allDayForm=dayNode.querySelector(".all-day-form");
    const timeline = dayNode.querySelector(".timeline");
    //form 에 eventColor 선탹
    const offcanvas = dayNode.querySelector(".offcanvas-sm");
    const offcanvasBtn = dayNode.querySelector(".offcanvas-btn");
    const offcanvasCloseBtn = dayNode.querySelector(".offcanvas-close-btn");

    const eventBtn=dayNode.querySelectorAll(".event-btn-container>button");
    timedForm.id+=key;
    allDayForm.id+=key;
    offcanvas.id+=key;
    offcanvasBtn.dataset.bsTarget+=key;
    //offcanvasCloseBtn.dataset.bsTarget+=key;

    eventBtn.forEach((btn)=>{
        btn.dataset.bsTarget+=key;
    });
    const radios=dayNode.querySelectorAll(".btn-check");

    radios.forEach((color)=>{
        const label=color.nextElementSibling;
        if(color) color.id+=key;
        if(label){
            let forAttribute=(label.getAttribute("for"));
            forAttribute+=key;
            label.setAttribute("for",forAttribute);
        }
        //label.for+=(yearMonth+""+dayNumber);
    });
    timedForm.onsubmit = (e) => {
        timedFormSubmitHandler(e, timeline);
    }



}
const cloneDayEx = function (dayNumber, dateData, addClassName) {
    const dayClone = dayEx.cloneNode(true);

    const timedSchedule = dayClone.querySelector('.timed-schedule');
    const allDaySchedule = dayClone.querySelector('.all-day-schedule');
    const timedUl = dayClone.querySelector('.timeline');
    const allDayUl = dayClone.querySelector('.all-day-ul');
    const schedule=renderDateData[dateData.nowDateNodeKey]?.schedule[dayNumber];
    if (schedule) {
        const allDay=schedule["allDay"];
        const timed=schedule["timed"];
        //const multiDay=schedule["multiDay"];
        allDayAppend(allDay, allDaySchedule,allDayUl);
        timedAppend(timed, timedSchedule,timedUl);

    }

    let key=dateData.nowDateNodeKey+(dayNumber<10 ? "0" : "")+dayNumber; //202412+""+01
    dayClone.removeAttribute('id');
    dayClone.querySelector('.day-number').textContent = dayNumber;

    const closeBtn = dayClone.querySelector('.btn-close');
    closeBtn.addEventListener('click',(e)=>{closeBtnHandler(e,dayClone);})

    dayClone.dataset.day = dayNumber;
    if (addClassName) dayClone.classList.add(addClassName);
    //form 설정
    setNewEventForm(dayClone,key);
    return dayClone;
}
const allDayAppend = function (schedules, allDaySchedule,allDayUl) {
    schedules.forEach(schedule => {
        //월 달력에 있는 작은 박스에 하루종일 이벤트 출력
        let li = allDayScheduleLiEx.cloneNode(true);
        let icon = li.querySelector('.icon');
        let title = li.querySelector('.title');

        li.removeAttribute('id');
        li.classList.add("bg-"+schedule["color"]);
        li.classList.add("border-"+schedule["color"]);
        title.textContent = schedule.eventName;
        icon.textContent = schedule.icon;
        allDaySchedule.appendChild(li);

        li=allDayLiEx.cloneNode(true);
        li.removeAttribute('id');
        li.classList.add("bg-"+schedule["color"]);
        li.classList.add("btn-"+schedule["color"]);

        icon=li.querySelector('.icon');
        title=li.querySelector('.title');
        title.textContent = schedule.eventName;
        icon.textContent = schedule.icon;
        allDayUl.appendChild(li);



    });
}
const timedAppend = function (schedules, timedSchedule,timedUl) {
    /*    "timed": [
      {
        "eventName": "팀 회의",
        "type": "timed",
        "hour": [
          1400,
          1500
        ],
        "icon": "👥",
        "color": "orange"
      },
*/
    schedules.forEach(schedule => {
        if(schedule.type !== "timed") return
        //월 달력에 있는 작은 박스에 시간 에벤트 출력
        let startTime=schedule.hour[0];
        let endTime=schedule.hour[1];
        let startHours = parseInt(startTime/60);
        let startMinutes=startTime%60;
        let endHours = parseInt(endTime/60);
        let endMinutes=endTime%60;
        let startStr=`${startHours}:${startMinutes}`;
        let endStr=`${endHours}:${endMinutes}`;
        let [top,height]=timedLiSetTopHeight(startStr,endStr);

        let li = timedScheduleLiEx.cloneNode(true);
        let icon = li.querySelector('.icon');
        let date = li.querySelector('.date');
        let title = li.querySelector('.title');
        li.removeAttribute('id');
        li.classList.add("bg-"+schedule["color"]);
        li.classList.add("border-"+schedule["color"]);

        li.dataset.bsTitle = `${startStr}-${endStr}`;
        new bootstrap.Tooltip(li);
        //date.textContent = `${startStr}-${endStr}`;

        title.textContent = schedule.eventName;
        icon.textContent = schedule.icon;
        timedSchedule.appendChild(li);

        li = timedLiEx.cloneNode(true);
        icon = li.querySelector('.icon');
        date = li.querySelector('.time');
        title = li.querySelector('.title');

        li.removeAttribute('id');
        li.classList.add(`btn-${schedule["color"]}`)
        li.style.top=top;
        li.style.height=height;
        title.textContent = schedule.eventName;
        li.dataset.time = `${startStr}-${endStr}`;
        date.textContent = `${startStr}-${endStr}`;
        icon.textContent = schedule.icon;
        timedUl.appendChild(li);
    });
}

class DateData {
    constructor(date, encode = "ko") {
        //현재 날짜
        this.nowDate = date;
        this.nowYear = this.nowDate.getFullYear();
        this.nowMonth = this.nowDate.getMonth();
        this.firstDay = new Date(this.nowYear, this.nowMonth, 1).getDay();//1일의 요일
        this.lastDate = new Date(this.nowYear, this.nowMonth + 1, 0);//마지막 날짜객체
        this.lastDay = this.lastDate.getDay();//마지막 날짜의 요일
        this.lastDateNum = this.lastDate.getDate();//마지막 날짜

        this.nowMonth += 1;

        this.nowDateKey = `${this.nowYear}-${this.nowMonth}`;
        this.nowDateNodeKey = Number(`${this.nowYear}${(this.nowMonth < 10) ? '0' : ''}${this.nowMonth}`);
        this.nowDateUrl = `${this.nowYear}_${this.nowMonth}_schedule.json`;


        //이전 달
        this.prevYear = (this.nowMonth - 1) === 0 ? this.nowYear - 1 : this.nowYear;
        this.prevMonth = (this.nowMonth - 1) === 0 ? 12 : this.nowMonth - 1;

        //다음 달
        this.nextYear = (this.nowMonth + 1) === 13 ? this.nowYear + 1 : this.nowYear;
        this.nextMonth = (this.nowMonth + 1) === 13 ? 1 : this.nowMonth + 1;


        //다음 달
        this.nextDate = new Date(this.nextYear, this.nextMonth, 0);
        this.nextDateKey = `${this.nextYear}-${this.nextMonth}`;
        //this.nextDateUrl=`${this.nextDate.getFullYear()}_${this.nextDate.getMonth()+1}_schedule.json`;
        this.nextDateNodeKey = Number(`${this.nextYear}${(this.nextMonth < 10) ? '0' : ''}${this.nextMonth}`);

        //이전 달
        this.prevDate = new Date(this.prevYear, this.prevMonth, 0);
        this.prevDateKey = `${this.prevYear}-${this.prevMonth}`;
        //this.prevDateUrl=`${this.prevDate.getFullYear()}_${this.prevDate.getMonth()+1}_schedule.json`;
        this.prevDateNodeKey = Number(`${this.prevYear}${(this.prevMonth < 10) ? '0' : ''}${this.prevMonth}`);

        this.encode = encode;


        switch (encode) {
            case "ko":
                this.monthYearString = `${this.nowMonth}월 ${this.nowYear}년`;
                this.monthString = `${this.nowMonth}월`;

                break;
            case "en":
                this.monthYearString = `${this.nowMonth} ${this.nowYear}`;
                this.monthString = `${this.nowMonth} Month`;

                break;
        }
    }
}

const observerCallback = function (entries, innerObserver) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) { // 달력 끝에 도달했을 때
            let nodeKey = entry.target.id;
            let dateData = renderDateData[nodeKey];


            if (entry.boundingClientRect.top < 0) { // 스크롤을 올릴 때
                //console.log("up");
                let prevDateKey = dateData.prevDateKey;
                let prevDateNodeKey = dateData.prevDateNodeKey;

                if (prevDateNodeKey in renderDateData) return;

                let prevDateData = await renderCalendar(new Date(prevDateKey));
                if (!prevDateData) return;

                const calendarNode = renderDateData[prevDateData.nowDateNodeKey];
                calendarContainer.insertBefore(calendarNode, calendarContainer.firstChild);

                observer.observe(calendarNode);
            } else {
                //console.log("down");
                let nextDateKey = dateData.nextDateKey;
                let nextDateNodeKey = dateData.nextDateNodeKey;

                if (nextDateNodeKey in renderDateData) return;

                let nextDateData = await renderCalendar(new Date(nextDateKey));
                if (!nextDateData) return;

                const calendarNode = renderDateData[nextDateData.nowDateNodeKey];
                calendarContainer.appendChild(calendarNode);

                observer.observe(calendarNode);

            }
            console.log(entry.target);

            observer.unobserve(entry.target); //인터섹션 옵저버 제거
        }
    });
}
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
    root: calendar
}
observer = new IntersectionObserver(observerCallback, observerOptions);
const createMonthNameNode=function (dateData) {
    const monthName = monthNameEx.cloneNode(true);
    monthName.removeAttribute('id');
    monthName.querySelector('.month-name').innerText = dateData.monthString;
    monthName.style.gridColumn = `${dateData.firstDay + 1} / 8`;
    return monthName;
}
const dyaNodeClickHandler=function (e) {

    if( e.target.classList.contains("btn-close") ) return;
    const dayFullNode=this.querySelector(".day-full");
    const rect = this.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;
    let top = rect.top + window.scrollY; // 페이지 전체 기준으로 top
    let left = rect.left + window.scrollX; // 페이지 전체 기준으로 left
    dayFullNode.classList.remove("none");
    dayFullNode.classList.add("full");
    width+="px";
    height+="px";
    top+="px";
    left+="px";

    const keyframes = {
        '0%': {
            position: 'fixed',
            boxSizing: 'border-box',
            width: width,
            height: height,
            left: left,
            top: top
        },
        '25%': {
            position: 'fixed',
            boxSizing: 'border-box',
            border: '1px solid #fff',
            width: width,
            height: height,
            left: left,
            top: top

        },
        '45%': {
            position: 'fixed',
            boxSizing: 'border-box',
            border: '1px solid #fff',
            width: width,
            height: height,
            left: left,
            top: top
        },

        '50%': {
            position: 'fixed',
            boxSizing: 'border-box',
            border: '1px solid #fff',
            left: left,
            top: top,
            width: width,
            height: height
        },
        '75%': {
            position: 'fixed',
            boxSizing: 'border-box',

            border: '1px solid #fff',
            left: '0',
            top: '0',
            width: width,
            height: height,
        },
        '100%': {
            position: 'fixed',
            boxSizing: 'border-box',

            border: '0px solid #fff',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%',
        },
    };
    createKeyframes('fade-in', keyframes);

    // 애니메이션 시작
    dayFullNode.style.animation = 'fade-in 1s forwards';
}
const renderCalendar = async function (date = new Date(), encode = "ko") {
    if(Number.isNaN(date.valueOf())) return;

    const dateData = new DateData(date, encode);
    if (dateData.nowDateNodeKey in renderDateData) {
        console.log('이미 렌더링된 달입니다.');
        return;
    }
    renderDateData[dateData.nowDateNodeKey]={}
    renderDateData[dateData.nowDateNodeKey]["data"] = dateData;
    const dayContainer = dayContainerEx.cloneNode(true);
    dayContainer.id = dateData.nowDateNodeKey;
    renderDateData[dateData.nowDateNodeKey]["node"] = dayContainer;
    // 공휴일 가져오기
    //const holidayData=await loadHoliday(dateData.nowYear.toString(), dateData.nowMonth.toString());

    const resArr = await fetch(`./data/${dateData.nowDateUrl}`);
    if (resArr.status === 200) {
        const schedule = await resArr.json();
        renderDateData[dateData.nowDateNodeKey]["schedule"] = schedule;
    }

    //이번 달 이름 추가

    const monthNameNode = createMonthNameNode(dateData);
    dayContainer.appendChild(monthNameNode);


    // 이전 달의 날짜들을 추가합니다
    for (let i = 0; i < dateData.firstDay; i++) {
        const day = dateData.lastDateNum - dateData.firstDay + i + 1;
        dayContainer.appendChild(cloneDayEx(day,dateData, 'empty'));
    }

    // 이번 달의 날짜들을 추가합니다
    for (let i = 1; i <= dateData.lastDateNum; i++) {

        const dayNode = cloneDayEx(i,dateData, "");
        //확대 이벤트 추가
        dayNode.addEventListener("click", dyaNodeClickHandler);
        dayContainer.appendChild(dayNode);
        // // 공휴일 내용 추가
        // if (scheduleData[`${dateData.nowDateKey}-${String(i).padStart(2, '0')}`]) {
        //     timedAppend(scheduleData[`${dateData.nowDateKey}-${String(i).padStart(2, '0')}`], scheduleUl);
        // }

    }

    return dateData;
}

const initCalendar = async function () {
    // 현재 날짜 처리
    const nowDate = new Date();
    const nowDateData = await renderCalendar(nowDate);
    selectedDateData = nowDateData;
    // 이전 및 다음 달 렌더링
    await Promise.all([
        renderCalendar(nowDateData.prevDate),
        renderCalendar(nowDateData.nextDate),
    ]);

    for (let key in renderDateData) {
        calendarContainer.appendChild(renderDateData[key]["node"]);
        //인터섹션 옵저버 추가 (무한스크롤구현)
        let scheduleNode = renderDateData[key]["node"];

        if (scheduleNode.id == nowDateData.nowDateNodeKey) {
            let nowDay = scheduleNode.querySelector([`[data-day="${nowDate.getDate()}"]`]);
            nowDay.id = "now"
            const calendarWrapper = calendar;  // 부모 요소
            const offsetTop = nowDay.offsetTop - calendarWrapper.offsetTop;  // 상대 위치 계산
            calendarWrapper.scrollTo({ top: offsetTop });
            observer.unobserve(scheduleNode)
        } else {
            observer.observe(scheduleNode);
        }
    }
}
export {initCalendar, renderCalendar, renderDateData, selectedDateData, scheduleData, observer}