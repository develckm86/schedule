const now=new Date(); //현재날짜
let meonthSchedules;
const loadSchedule=async ()=>{
    //2024_12_schedule.json (현재 날짜 불러오기)
    let fileName=`./data/${now.getFullYear()}_${now.getMonth()+1}_schedule.json`;
    let resArr=Promise.all([
        fetch(fileName),
        fetch("./data/loginUser.json")
    ]);     
}
loadSchedule();