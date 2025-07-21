document.addEventListener("DOMContentLoaded",function(){
    const srchButton=document.getElementById("srch");
    const usernameInput=document.getElementById("user_input");
    const statsContainer=document.querySelector(".stats_container");
    const easyProgresssCircle=document.querySelector(".easy_progress");
    const mediumProgresssCircle=document.querySelector(".medium_progress");
    const hardProgresssCircle=document.querySelector(".hard_progress");
    const easyLabel=document.getElementById("easyp");
    const mediumLabel=document.getElementById("mediump");
    const hardLabel=document.getElementById("hardp");
    const cardStatsContainer=document.querySelector(".stats_card");



    function validateUsername(username){
        if(username.trim()===""){
            alert("Username should not be empty");
            return false;
        }
        const regex =/^[a-zA-Z0-9_-]{4,16}$/;
        const isMatching=regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;

    }

    

    async function fetchUserDetails(username){
        
        try{
            srchButton.textContent="Searching...";
            srchButton.disabled = true;

            // const response = await fetch(url);
            const proxyurl="https://cors-anywhere.herokuapp.com/";
            const targeturl=`https://leetcode.com/graphql/`;
            const myHeaders=new Headers();
            myHeaders.append("content-type","application/json");

            const graphql= JSON.stringify({
                query:  `
    query userSessionProgress($username: String!) {
        allQuestionsCount {
            difficulty
            count
        }
        matchedUser(username: $username) {
            submitStats {
                acSubmissionNum {
                    difficulty
                    count
                    submissions
                }
                totalSubmissionNum {
                    difficulty
                    count
                    submissions
                }
            }
        }
    }
`, variables: { "username":`${username}`}
            })
            const requestOptions = {
                method:"POST",
                headers:myHeaders,
                body:graphql,
                redirect:"follow"
            };

            const response=await fetch(proxyurl+targeturl,requestOptions);


            if(!response.ok){
                throw new Error("Unable to fetch the User Details");
            }
            const parseddata = await response.json();
            console.log("Logging data:",parseddata);

            displayUserData(parseddata);
        }
        catch(error){
            statsContainer.innerHTML=`<p>No Data Found</p>`;
        }
        finally{
            srchButton.textContent="Search";
            srchButton.disabled=false;
        }
    }

    function updateProgress(solved,total,label,circle){
        const processDegree=(solved/total)*100;
        circle.style.setProperty("--progress-degree", `${processDegree}%`);

        label.textContent=`${solved}/${total}`;


    }

    function displayUserData(parseddata){
        const totalQues=parseddata.data.allQuestionsCount[0].count;
        const totalEasyQues=parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues=parseddata.data.allQuestionsCount[2].count;
        const totalHardQues=parseddata.data.allQuestionsCount[3].count;

        const solvedTotalQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues=parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQues,totalEasyQues,easyLabel,easyProgresssCircle);
        updateProgress(solvedMediumQues,totalMediumQues,mediumLabel,mediumProgresssCircle);
        updateProgress(solvedHardQues,totalHardQues,hardLabel,hardProgresssCircle);

        const cardData = [
  { label: "Overall Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
  { label: "Overall Easy Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
  { label: "Overall Medium Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
  { label: "Overall Hard Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions }
];


        cardStatsContainer.innerHTML=cardData.map(
            data =>
                `<div class="card">
                 <h3>${data.label}</h3>
                 <p>${data.value}</p>
                 </div>`

            
        ).join("");
        

    }
    srchButton.addEventListener('click',function(){
        const username = usernameInput.value;
        console.log(username);
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })

})