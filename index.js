document.addEventListener("DOMContentLoaded",function(){
    const srchButton=document.getElementById("srch");
    const usernameInput=document.getElementById("user_input");
    const statsContainer=document.getElementsByClassName("stats_container")[0];
    const cardStatsContainer=document.getElementsByClassName("stats_card")[0];

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
        srchButton.textContent = "Searching...";
        srchButton.disabled = true;

        const targeturl = `http://localhost:4000/leetcode-proxy`;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const graphql = JSON.stringify({
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
            `,
            variables: { "username": `${username}` }
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: graphql,
            redirect: "follow"
        };

        const response = await fetch(targeturl, requestOptions);

        if (!response.ok) {
            throw new Error("Unable to fetch the User Details");
        }

        const parseddata = await response.json();
        console.log("Logging data:", parseddata);

        displayUserData(parseddata);
    }
    catch(error){
        statsContainer.innerHTML = `<p>No Data Found</p>`;
        console.error(error.message);
    }
    finally{
        srchButton.textContent = "Search";
        srchButton.disabled = false;
    }
}

    function updateProgress(solved, total, label, circle){
        const processDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${processDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parseddata) {
        if (parseddata.data.matchedUser === null) {
            statsContainer.innerHTML = "No Data Found.";
            return;
        }

        // Recreate the HTML structure
        statsContainer.innerHTML = `
            <div class="progress">
                <div class="progress_item">
                    <div class="easy_progress circle">
                        <span id="easyp"></span>
                        <p>Easy</p>
                    </div>
                </div>
                <div class="progress_item">
                    <div class="medium_progress circle">
                        <span id="mediump"></span>
                        <p>Medium</p>
                    </div>
                </div>
                <div class="progress_item">
                    <div class="hard_progress circle">
                        <span id="hardp"></span>
                        <p>Hard</p>
                    </div>
                </div>
            </div>
            <div class="stats_card"></div>
        `;

        // Get fresh references to the newly created elements
        const easyProgressCircle = document.getElementsByClassName("easy_progress")[0];
        const mediumProgressCircle = document.getElementsByClassName("medium_progress")[0];
        const hardProgressCircle = document.getElementsByClassName("hard_progress")[0];
        const easyLabel = document.getElementById("easyp");
        const mediumLabel = document.getElementById("mediump");
        const hardLabel = document.getElementById("hardp");
        const cardStatsContainer = document.getElementsByClassName("stats_card")[0];

        const totalQues = parseddata.data.allQuestionsCount[0].count;
        const totalEasyQues = parseddata.data.allQuestionsCount[1].count;
        const totalMediumQues = parseddata.data.allQuestionsCount[2].count;
        const totalHardQues = parseddata.data.allQuestionsCount[3].count;

        const solvedTotalQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardData = [
            { label: "Overall Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: parseddata.data.matchedUser.submitStats.totalSubmissionNum[3].submissions }
        ];

        cardStatsContainer.innerHTML = cardData.map(data =>
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
            console.log("running");
            fetchUserDetails(username);
        }
    })

})