const dayEx = document.getElementById('dayEx');
const currentMonthLabel = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonthBtn');
const nextMonthButton = document.getElementById('nextMonthBtn');
const scheduleLiEx=document.getElementById('scheduleLiEx');
const calendarContainer=document.getElementById('calendarContainer');
const dayContainerEx=document.getElementById('dayContainerEx');
console.log(calendarContainer);

// Example schedule data
const scheduleData={};
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
    
    //이전 달
    this.prevDate=new Date(this.prevYear,this.prevMonth,0);
    this.prevDateKey=`${this.prevYear}-${this.prevMonth}`;
    //this.prevDateUrl=`${this.prevDate.getFullYear()}_${this.prevDate.getMonth()+1}_schedule.json`;
    this.encode=encode;
    
    switch(encode){
      case "ko":
        this.monthString=`${this.nowMonth}월 ${this.nowYear}년`;
        break;
      case "en":
        this.monthString=`${this.nowMonth} ${this.nowYear}`;
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
const scheduleNodes={};

// 캘린더 렌더링
const renderCalendar=async function (date=new Date(), encode="ko") {

  const dateData=new DateData(date,encode);
  console.log(dateData);
  if(scheduleData[dateData.nowDateKey]){
    console.log('이미 렌더링된 달입니다.');
    return;
  }

  const dayContainer=dayContainerEx.cloneNode(true);
  dayContainer.id=dateData.nowDateKey;
  calendarContainer.appendChild(dayContainer);

  //3달치 데이터를 가져옴
  const resArr=await fetch(`./data/${dateData.nowDateUrl}`);

  if(resArr.status===200){
    const schedule=await resArr.json();
    for(let key in schedule){
      scheduleData[key]=schedule[key];
      scheduleData[key]["dateData"]=dateData;
      scheduleNodes[dateData.nowDateNodeKey]=dayContainer;
    }
  console.log(scheduleData);
  }

  currentMonthLabel.textContent=dateData.monthString;
  
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

  // 다음 달의 날짜들을 추가합니다.
  for(let i=1;i<=(6-dateData.lastDay);i++){
    const day=dateData.lastDateNum - dateData.lastDay + i + 1;
    dayContainer.appendChild(cloneDayEx(day,'empty'));
  }
  prevMonthButton.onclick=()=>{
    renderCalendar(dateData.prevDate);
  }
  
  nextMonthButton.onclick=()=>{
    renderCalendar(dateData.nextDate);
  }
}

renderCalendar();
