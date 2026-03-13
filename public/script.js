let chart
let balanceChart
let scheduleData=[]

function calculateLoan(){

let amount=parseFloat(document.getElementById("amount").value)
let rate=parseFloat(document.getElementById("rate").value)
let months=parseInt(document.getElementById("months").value)
let salary=parseFloat(document.getElementById("salary").value)

if(!amount || !rate || !months){
alert("Please fill all fields")
return
}

fetch(`/calculate?amount=${amount}&rate=${rate}&months=${months}`)
.then(res=>res.text())
.then(data=>{

let values=data.split("|")

let emi=parseFloat(values[0])
let payment=parseFloat(values[1])
let interest=parseFloat(values[2])

document.getElementById("emi").innerText=emi.toFixed(2)
document.getElementById("payment").innerText=payment.toFixed(2)
document.getElementById("interest").innerText=interest.toFixed(2)

drawChart(amount,interest)

generateSchedule(amount,rate,months,emi)

drawBalanceChart()

saveHistory(amount,rate,months,emi)

checkAffordability(emi,salary)

loadHistory()

})

}

function drawChart(principal,interest){

const ctx=document.getElementById("loanChart")

if(chart) chart.destroy()

chart=new Chart(ctx,{
type:'pie',
data:{
labels:["Principal","Interest"],
datasets:[{
data:[principal,interest],
backgroundColor:["#00e5ff","#ff4d6d"]
}]
}
})

}

function generateSchedule(amount,rate,months,emi){

scheduleData=[]

let balance=amount
let monthlyRate=rate/12/100

let table=document.getElementById("tableBody")
table.innerHTML=""

for(let i=1;i<=months;i++){

let interest=balance*monthlyRate
let principal=emi-interest

balance=balance-principal
if(balance<0) balance=0

scheduleData.push(balance)

let row=`
<tr>
<td>${i}</td>
<td>${emi.toFixed(2)}</td>
<td>${interest.toFixed(2)}</td>
<td>${principal.toFixed(2)}</td>
<td>${balance.toFixed(2)}</td>
</tr>
`

table.insertAdjacentHTML("beforeend",row)

}

}

function drawBalanceChart(){

const ctx=document.getElementById("balanceChart")

if(balanceChart) balanceChart.destroy()

balanceChart=new Chart(ctx,{
type:'line',
data:{
labels:scheduleData.map((_,i)=>i+1),
datasets:[{
label:"Remaining Balance",
data:scheduleData,
borderColor:"#00e5ff",
tension:0.3,
fill:false
}]
},
options:{
animation:{duration:2000}
}
})

}

function compareLoans(){

let a1=parseFloat(document.getElementById("amount").value)
let r1=parseFloat(document.getElementById("rate").value)
let m1=parseInt(document.getElementById("months").value)

let a2=parseFloat(document.getElementById("amount2").value)
let r2=parseFloat(document.getElementById("rate2").value)
let m2=parseInt(document.getElementById("months2").value)

let emi1=calculateEMI(a1,r1,m1)
let emi2=calculateEMI(a2,r2,m2)

let result=(emi1<emi2)?"Loan 1 is cheaper":"Loan 2 is cheaper"

document.getElementById("compareResult").innerText=
`Loan1 EMI: ${emi1.toFixed(2)} | Loan2 EMI: ${emi2.toFixed(2)} → ${result}`

}

function calculateEMI(P,R,N){

let r=R/12/100

let emi=P*r*Math.pow(1+r,N)/(Math.pow(1+r,N)-1)

return emi

}

function clearForm(){

document.getElementById("amount").value=""
document.getElementById("rate").value=""
document.getElementById("months").value=""
document.getElementById("salary").value=""

document.getElementById("tableBody").innerHTML=""

if(chart) chart.destroy()
if(balanceChart) balanceChart.destroy()

}

function toggleTheme(){
document.body.classList.toggle("dark")
}

function checkAffordability(emi,salary){

let warn=document.getElementById("warning")

if(!salary) return

if(emi>salary*0.4)
warn.innerText="Warning: EMI exceeds 40% of salary"
else
warn.innerText=""

}

function saveHistory(amount,rate,months,emi){

let history=JSON.parse(localStorage.getItem("loanHistory")||"[]")

history.push({amount,rate,months,emi})

localStorage.setItem("loanHistory",JSON.stringify(history))

}

function loadHistory(){

let history=JSON.parse(localStorage.getItem("loanHistory")||"[]")

let list=document.getElementById("historyList")

list.innerHTML=""

history.slice(-5).reverse().forEach(item=>{

let li=document.createElement("li")

li.innerText=`Loan ${item.amount} | EMI ${item.emi.toFixed(2)}`

list.appendChild(li)

})

}

function downloadPDF(){

const {jsPDF}=window.jspdf

let doc=new jsPDF()

doc.text("Loan EMI Schedule",20,20)

let rows=document.querySelectorAll("#schedule tr")

let y=30

rows.forEach(row=>{

let cols=row.querySelectorAll("td,th")

let text=""

cols.forEach(col=>{ text+=col.innerText+"   " })

doc.text(text,20,y)

y+=8

})

doc.save("loan_schedule.pdf")

}

window.onload=loadHistory