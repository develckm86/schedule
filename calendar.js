const dayEx = document.getElementById('dayEx');
const currentMonthLabel = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonthBtn');
const nextMonthButton = document.getElementById('nextMonthBtn');
const scheduleLiEx=document.getElementById('scheduleLiEx');
const calendarContainer=document.getElementById('calendarContainer');
const dayContainerEx=document.getElementById('dayContainerEx');
const monthNameEx=document.getElementById('monthNameEx');
const renderDateData={};
let selectedDateData=null;
// Example schedule data
const scheduleData={};
const scheduleNodes={};
var observer=null;

const cloneDayEx=function(dayNumber,addClassName){
  const dayClone = dayEx.cloneNode(true);
  dayClone.removeAttribute('id');
  dayClone.querySelector('.day-number').textContent = dayNumber;
  dayClone.dataset.day=dayNumber;
  if(addClassName) dayClone.classList.add(addClassName);
  //dayClone.classList.add('empty');//투명하게 만들기
  return dayClone;
}
const scheduleLiAppendScheduleUl=function(schedules,scheduleUlNode){
  schedules.forEach(schedule=>{
    const liClone = scheduleLiEx.cloneNode(true);
    liClone.removeAttribute('id');
    liClone.querySelector('.icon').classList.add(schedule.icon);
    let title=liClone.querySelector('.title');
    title.dataset.time=Math.floor(schedule.hour/60)+':'+schedule.hour%60;
    title.textContent=schedule.title;
    scheduleUlNode.appendChild(liClone);
  });
}
class DateData{
  constructor(date,encode="ko"){
    //현재 날짜
    this.nowDate=date;
    this.nowYear=this.nowDate.getFullYear();
    this.nowMonth=this.nowDate.getMonth()+1;
    this.nowDateKey=`${this.nowYear}-${this.nowMonth}`;    
    this.nowDateNodeKey=Number(`${this.nowYear}${(this.nowMonth < 10)?'0':''}${this.nowMonth}`);
    this.nowDateUrl=`${this.nowYear}_${this.nowMonth}_schedule.json`;

    //this.nowDay=this.nowDate.getDate();

    //이전 달
    this.prevYear=(this.nowMonth-1)===0?this.nowYear-1:this.nowYear;
    this.prevMonth=(this.nowMonth-1)===0?12:this.nowMonth-1;

    //다음 달
    this.nextYear=(this.nowMonth+1)===13?this.nowYear+1:this.nowYear;
    this.nextMonth=(this.nowMonth+1)===13?1:this.nowMonth+1;
   
    
    this.firstDay=new Date(this.nowYear,this.nowMonth,1).getDay();//1일의 요일
    this.lastDate=new Date(this.nowYear,this.nowMonth+1,0);//마지막 날짜객체
    this.lastDay=this.lastDate.getDay();//마지막 날짜의 요일
    this.lastDateNum=this.lastDate.getDate();//마지막 날짜


    //다음 달
    this.nextDate=new Date(this.nextYear,this.nextMonth,0); 
    this.nextDateKey=`${this.nextYear}-${this.nextMonth}`;
    //this.nextDateUrl=`${this.nextDate.getFullYear()}_${this.nextDate.getMonth()+1}_schedule.json`;
    this.nextDateNodeKey=Number(`${this.nextYear}${(this.nextMonth < 10)?'0':''}${this.nextMonth}`);
    
    //이전 달
    this.prevDate=new Date(this.prevYear,this.prevMonth,0);
    this.prevDateKey=`${this.prevYear}-${this.prevMonth}`;
    //this.prevDateUrl=`${this.prevDate.getFullYear()}_${this.prevDate.getMonth()+1}_schedule.json`;
    this.prevDateNodeKey=Number(`${this.prevYear}${(this.prevMonth < 10)?'0':''}${this.prevMonth}`);

    this.encode=encode;

    
    switch(encode){
      case "ko":
        this.monthYearString=`${this.nowMonth}월 ${this.nowYear}년`;
        this.monthString=`${this.nowMonth}월`;

        break;
      case "en":
        this.monthYearString=`${this.nowMonth} ${this.nowYear}`;
        this.monthString=`${this.nowMonth} Month`;

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

const observerCallback=function(entries,inerObserver){
  entries.forEach( async entry =>{
    if(entry.isIntersecting){ //달력 끝에 도달했을 때
      console.log(entry.target.dataset.nodeKey);
      let nodeKey=entry.target.dataset.nodeKey;
      let dateData=renderDateData[nodeKey];
      let nextDateKey=dateData.nextDateKey;
      let nextdateData=await renderCalendar(new Date(nextDateKey));
      const calendarNode=scheduleNodes[nextdateData.nowDateNodeKey];
      calendarContainer.appendChild(calendarNode);
      
      setTimeout(() => {
        observer.observe(calendarNode);
      }, 0); // Delay observer.observe to ensure DOM update
      console.log(calendarNode);
      
      //inerObserver.unobserve(entry.target); //인터섹션 옵저버 제거
    }
  });
}
const observerOptions={
  threshold: 0.5,
  rootMargin: '0px',
  root:calendarContainer
}

var observer=new IntersectionObserver(observerCallback,observerOptions);

// 캘린더 렌더링
const renderCalendar=async function (date=new Date(), encode="ko") {

  const dateData=new DateData(date,encode);
  
  if(dateData.nowDateNodeKey in renderDateData){
    console.log('이미 렌더링된 달입니다.');
    return;
  }
  renderDateData[dateData.nowDateNodeKey]=dateData;
  const dayContainer=dayContainerEx.cloneNode(true);
  dayContainer.id=dateData.nowDateKey;
  dayContainer.dataset.nodeKey=dateData.nowDateNodeKey;
  scheduleNodes[dateData.nowDateNodeKey]=dayContainer;

  const resArr=await fetch(`./data/${dateData.nowDateUrl}`);

  if(resArr.status===200){
    const schedule=await resArr.json();
    for(let key in schedule){
      scheduleData[key]=schedule[key];
      scheduleData[key]["dateData"]=dateData;
    }
  console.log(scheduleData);
  }

  console.log(dateData);
  //이번 달 이름 추가
  const monthName=monthNameEx.cloneNode(true);
  monthName.removeAttribute('id');
  monthName.querySelector('.month_name').innerText=dateData.monthString;
  monthName.style.gridColumn=`${dateData.firstDay+1} / 8`;
  
  dayContainer.appendChild(monthName);    

  
  // 이전 달의 날짜들을 추가합니다
  for (let i = 0; i < dateData.firstDay; i++) {
    const day=dateData.lastDateNum - dateData.firstDay + i + 1;
    dayContainer.appendChild(cloneDayEx(day,'empty'));
    
  }

  // 이번 달의 날짜들을 추가합니다
  for (let i = 1; i <= dateData.lastDateNum; i++) {
    const dayNode=cloneDayEx(i);
    dayContainer.appendChild(dayNode);
    const scheduleUl=dayNode.querySelector('.day-schedule');
    if(scheduleData[dateData.nowDateKey]?.hasOwnProperty(i)){
      scheduleLiAppendScheduleUl(scheduleData[dateData.nowDateKey][i],scheduleUl);
    }
  }

  return dateData;
}
const calendarNodesAppend=function(dateData){
  
}
// const nextMonthButtonClick=async function(){

//   console.log(scheduleData);


//   if(scheduleData[selectedDateData.nextDateNodeKey]){
//     console.log("이미 렌더링된 달입니다.???");
//     return;
//   }
// }
// const prevMonthButtonClick=async function(){
//   const prevDateData=await renderCalendar(selectedDateData.prevDate);
//   calendarNodesAppend(prevDateData);
// }
const initCalendar= async function(){
  const nowDateData=await renderCalendar();
  let selectedDateData=nowDateData;
  await renderCalendar(nowDateData.prevDate);
  await renderCalendar(nowDateData.nextDate);  

  for(let key in scheduleNodes){
    calendarContainer.appendChild(scheduleNodes[key]);
    //인터섹션 옵저버 추가 (무한스크롤구현)
    console.log(scheduleNodes[key]);
    observer.observe(scheduleNodes[key]); 

  }
  window.location.href=`./#${nowDateData.nowDateKey}`;
}
initCalendar();
