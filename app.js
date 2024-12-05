//container.innerText="???";//defer

//project
//1. 로그인 유저를 먼저 불러오기 (상품 리스트,공휴일)
//2. 그 유저와 관련된 데이터 불러오기(장바구니,스케줄)

const loadData=async function(){
    let resArr=await Promise.all([
        fetch("./loginUser.json"),
        fetch("./products.json")
    ]);
    let objArr=await Promise.all([
        resArr[0].json(),
        resArr[1].json()
    ]);
    console.log(objArr);
    const loginUser=objArr[0];
    const products=objArr[1];
    //baskets?user_id=develckm; => deveckmBaskets.json
    let res3=await fetch(`./${loginUser["user_id"]}Baskets.json`);
    let baskets=await res3.json();
    console.log(baskets); 
}
loadData();