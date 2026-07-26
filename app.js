function createPost(){

const title =
document.getElementById("title").value || "idea";


const body =
document.getElementById("body").value;


if(!body){

alert("本文を入力してください");

return;

}


const now =
new Date();


const date =
now.toISOString()
.replace(/[-:]/g,"")
.replace("T","_")
.slice(0,15);



const fileName =
date + "_" + safeFileName(title) + ".md";



const content =
`
# ${title}

日時:
${now.toLocaleString("ja-JP")}


状態:
inbox


内容:

${body}

`;



const blob =
new Blob(
[content],
{type:"text/markdown"}
);



const link =
document.createElement("a");


link.href =
URL.createObjectURL(blob);


link.download =
fileName;


link.click();


document.getElementById("status")
.innerText =
"投函しました";


}



function safeFileName(text){

return text.replace(/[\\/:*?"<>|]/g,"_");

}