const loadHoliday=async function (year,month){
    let url="https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?";
    const param=[
        ["serviceKey","xi57P5IuOZu/EQiKabza+n1T+R7WOrqG46ah8ICFC1cHqVFKgHnFkzq+fV2x7utuyxtPAjJUq9s94G+JLtKbsg=="],
        ["solYear",year],
        ["month",month],
        ["_type","json"]
    ]
    let queryString=new URLSearchParams(param);
    url+=queryString;
    // 변환된 데이터를 저장할 객체
    const res=await fetch(url);
    console.log(res);
    
    const data=await res.json();
    console.log(data);
    
    const transformedData = {};
    // 결과를 변환
    
    const items = data.response.body.items.item;
    items.forEach(item => {
        const date = item.locdate.toString();
        const dateKey = date.substring(0, 4) + '-' + date.substring(4, 6);
        const dayKey = date.substring(6, 8);
        
        if (!transformedData[dateKey]) {
            transformedData[dateKey] = {};
        }
        if (!transformedData[dateKey][dayKey]) {
            transformedData[dateKey][dayKey] = [];
        }
        transformedData[dateKey][dayKey].push({
            hour: 0, // 예시 시간, 필요에 따라 수정
            title: item.dateName,
            icon: "icon-holiday" // 예시 아이콘, 필요에 따라 수정
        });
    });
    
    return (transformedData); // 변환된 데이터 출력
}

export{loadHoliday}