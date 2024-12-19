import {loadHoliday} from "./ko_holiday.js";

const dayEx = document.getElementById('dayEx');
const currentMonthLabel = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonthBtn');
const nextMonthButton = document.getElementById('nextMonthBtn');
const scheduleLiEx = document.getElementById('scheduleLiEx');
const calendarContainer = document.getElementById('calendarContainer');
const dayContainerEx = document.getElementById('dayContainerEx');
const monthNameEx = document.getElementById('monthNameEx');

const renderDateData = {};
let selectedDateData = null;
// Example schedule data
const scheduleData = {};
const scheduleNodes = {};
let observer = null;

const cloneDayEx = function (dayNumber, addClassName) {
    const dayClone = dayEx.cloneNode(true);
    dayClone.removeAttribute('id');
    dayClone.querySelector('.day-number').textContent = dayNumber;
    dayClone.dataset.day = dayNumber;
    if (addClassName) dayClone.classList.add(addClassName);
    //dayClone.classList.add('empty');//투명하게 만들기
    return dayClone;
}
const scheduleLiAppendScheduleUl = function (schedules, scheduleUlNode) {
    schedules.forEach(schedule => {
        const liClone = scheduleLiEx.cloneNode(true);
        liClone.removeAttribute('id');
        liClone.querySelector('.icon').classList.add(schedule.icon);
        let title = liClone.querySelector('.title');
        title.dataset.time = Math.floor(schedule.hour / 60) + ':' + schedule.hour % 60;
        title.textContent = schedule.title;
        scheduleUlNode.appendChild(liClone);
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

// const scheduleNodes={
//   202401 : dayContainerEx,
//   202402 : dayContainerEx,
//   202403 : dayContainerEx,
//   202404 : dayContainerEx,
//   202405 : dayContainerEx,
//   202406 : dayContainerEx,
// }
//
const observerCallback = function (entries, inerObserver) {
    entries.forEach(async entry => {
        if (entry.isIntersecting) { // 달력 끝에 도달했을 때
            let nodeKey = entry.target.id;
            let dateData = renderDateData[nodeKey];


            if (entry.boundingClientRect.top < 0) { // 스크롤을 올릴 때
                console.log("up");
                let prevDateKey = dateData.prevDateKey;
                let prevDateNodeKey = dateData.prevDateNodeKey;
                if (prevDateNodeKey in scheduleNodes) return;
                let prevdateData = await renderCalendar(new Date(prevDateKey));
                const calendarNode = scheduleNodes[prevdateData.nowDateNodeKey];
                calendarContainer.insertBefore(calendarNode, calendarContainer.firstChild);

                observer.observe(calendarNode);
            } else {
                console.log("down");
                let nextDateKey = dateData.nextDateKey;
                let nextDateNodeKey = dateData.nextDateNodeKey
                if (nextDateNodeKey in scheduleNodes) return;

                let nextdateData = await renderCalendar(new Date(nextDateKey));
                const calendarNode = scheduleNodes[nextdateData.nowDateNodeKey];
                calendarContainer.appendChild(calendarNode);

                observer.observe(calendarNode);
            }


            //inerObserver.unobserve(entry.target); //인터섹션 옵저버 제거
        }
    });
}
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px',
    root: calendarContainer
}
observer = new IntersectionObserver(observerCallback, observerOptions);

// 캘린더 렌더링
/**
 * 특정 날짜에 대한 캘린더를 렌더링합니다.
 * 이 함수는 스케줄 데이터를 가져오고, 캘린더 세부 정보를 DOM에 업데이트하며, 렌더링된 데이터를 캐싱 목적으로 저장합니다.
 *
 * @param {Date} [date=new Date()] - 렌더링할 대상 날짜입니다. 기본값은 현재 날짜입니다.
 * @param {string} [encode="ko"] - 일반적으로 로컬라이제이션에 사용되는 인코딩 유형입니다. 기본값은 "ko"입니다.
 * @returns {Promise<Object>} 생성된 날짜 데이터 객체를 포함하는 Promise를 반환하며, 이 객체에는 현재 캘린더 달에 대한 정보가 포함됩니다.
 *
 * @throws {Error} 데이터 가져오기에 실패하거나 제공된 날짜 및 인코딩 입력값이 유효하지 않은 경우 오류를 발생시킵니다.
 */
const renderCalendar = async function (date = new Date(), encode = "ko") {

    const dateData = new DateData(date, encode);

    if (dateData.nowDateNodeKey in renderDateData) {
        console.log('이미 렌더링된 달입니다.');
        return;
    }
    renderDateData[dateData.nowDateNodeKey] = dateData;
    const dayContainer = dayContainerEx.cloneNode(true);
    dayContainer.id = dateData.nowDateNodeKey;
    scheduleNodes[dateData.nowDateNodeKey] = dayContainer;
    // 공휴일 가져오기
    const holidayData=await loadHoliday(dateData.nowYear.toString(), dateData.nowMonth.toString());



    const resArr = await fetch(`./data/${dateData.nowDateUrl}`);

    if (resArr.status === 200) {
        const schedule = await resArr.json();
        for (let key in schedule) {
            scheduleData[key] = schedule[key];
            scheduleData[key]["dateData"] = dateData;
        }
    }

    //이번 달 이름 추가
    const monthName = monthNameEx.cloneNode(true);
    monthName.removeAttribute('id');
    monthName.querySelector('.month_name').innerText = dateData.monthString;
    monthName.style.gridColumn = `${dateData.firstDay + 1} / 8`;

    dayContainer.appendChild(monthName);


    // 이전 달의 날짜들을 추가합니다
    for (let i = 0; i < dateData.firstDay; i++) {
        const day = dateData.lastDateNum - dateData.firstDay + i + 1;
        dayContainer.appendChild(cloneDayEx(day, 'empty'));

    }

    // 이번 달의 날짜들을 추가합니다
    for (let i = 1; i <= dateData.lastDateNum; i++) {
        const dayNode = cloneDayEx(i);
        //
        dayContainer.appendChild(dayNode);
        const scheduleUl = dayNode.querySelector('.day-schedule');
        if (scheduleData[dateData.nowDateKey]?.hasOwnProperty(i)) {
            scheduleLiAppendScheduleUl(scheduleData[dateData.nowDateKey][i], scheduleUl);
        }
        // 공휴일 내용 추가
        if (scheduleData[`${dateData.nowDateKey}-${String(i).padStart(2, '0')}`]) {
            scheduleLiAppendScheduleUl(scheduleData[`${dateData.nowDateKey}-${String(i).padStart(2, '0')}`], scheduleUl);
        }

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

    for (let key in scheduleNodes) {
        calendarContainer.appendChild(scheduleNodes[key]);
        //인터섹션 옵저버 추가 (무한스크롤구현)
        let scheduleNode = scheduleNodes[key];

        if (scheduleNode.id == nowDateData.nowDateNodeKey) {
            let nowDay = scheduleNode.querySelector([`[data-day="${nowDate.getDate()}"]`]);
            nowDay.id = "now"
            observer.unobserve(scheduleNode)
        } else {
            observer.observe(scheduleNode);
        }
    }

    window.location.href = `./#${nowDateData.nowDateNodeKey}`;
}
export {initCalendar, renderCalendar, renderDateData, selectedDateData, scheduleData, scheduleNodes, observer}