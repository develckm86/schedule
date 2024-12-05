const dayEx = document.querySelector('#dayEx');
const dayContainer = document.querySelector('#dayContainer');
const currentMonthLabel = document.getElementById('currentMonth');
const prevMonthButton = document.getElementById('prevMonthBtn');
const nextMonthButton = document.getElementById('nextMonthBtn');
const scheduleLiEx=document.querySelector('#scheduleLiEx');

let currentDate = new Date();

// Example schedule data
let scheduleData;
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

// 캘린더 렌더링
const renderCalendar=function (date, encode="ko") {
  dayContainer.innerHTML = '';

  let month=date.getMonth()+1;
  let year=date.getFullYear();
  let monthString;
  
  switch(encode){
    case "ko":
      monthString=`${month}월 ${year}년`;
      break;
    case "en":
      monthString=`${month} ${year}`;
      break;
  }
  currentMonthLabel.textContent =monthString;
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 1일의 요일
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); // 마지막 날짜
  const lastDay=new Date(date.getFullYear(),date.getMonth()+1,0).getDay(); // 마지막 날짜의 요일
  
  // 이전 달의 날짜들을 추가합니다
  for (let i = 0; i < firstDay; i++) {
    day=lastDate - firstDay + i + 1;
    dayContainer.appendChild(cloneDayEx(day,'empty'));
    
  }

  // 이번 달의 날짜들을 추가합니다
  for (let i = 1; i <= lastDate; i++) {
    const dayNode=cloneDayEx(i);
    dayContainer.appendChild(dayNode);
    let key=`${year}-${month}-${i}`;

    if(key in scheduleData){
      scheduleLiAppendScheduleUl(scheduleData[key],dayNode.querySelector('.day-schedule'));
    }
  }

  // 다음 달의 날짜들을 추가합니다.
  for(let i=1;i<=(6-lastDay);i++){
    dayContainer.appendChild(cloneDayEx(i,'empty'));
  }
}

prevMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
});


async function init(){
  let url=`${currentDate.getFullYear()}_${currentDate.getMonth()+1}_schedule.json`;
  scheduleData=await fetch(`./data/${url}`)
  .then(res=>res.json());
  // Initial render
  renderCalendar(currentDate);
}
init();
