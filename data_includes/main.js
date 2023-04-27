// Type code below this line.

// Remove command prefix
PennController.ResetPrefix(null)

// Turn off debugger
DebugOff();

// Increment the counter for list balancing
SetCounter("counter", "inc", 1);

// Control trial sequence
Sequence(//"consent",
         //"demographics", 
         //"instructions",
         //"practice",
         //"practice-end",
         shuffle(randomize("experimental-trial"), randomize("fillers")), 
         "done",
         "debriefing",
         "send", 
         "completion_screen"
         )

// Consent form
newTrial("consent",
    newHtml("consent_form", "consent.html")
        .checkboxWarning("יש להסכים לפני שניתן להמשיך")
        .center()
        .print()
    ,
    newButton("continue", "המשך")
        .center()
        .cssContainer({"margin-bottom":"2em", "margin-top":"2em"})
        .print()
        .wait(getHtml("consent_form").test.complete()
                  .failure(getHtml("consent_form").warn())
        )
)

//demographics
newTrial("demographics",
    newHtml("demographics_form", "demographics.html")
        .cssContainer({"width":"720px"})
        .center()
        .print()
        .log()
    ,
    newButton("continue", "המשך")
        .center()
        .print()
        .cssContainer({"margin-bottom":"2em", "margin-top":"2em"})
        .wait(getHtml("demographics_form").test.complete()
            .failure(getHtml("demographics_form").warn())
        )
)

// Instructions
newTrial("instructions",
    newHtml("instructions", "instructions.html")
        .cssContainer({"width":"720px"})
        .center()
        .print()
    ,
    newButton("continue", "המשך")
        .center()
        .print()
        .cssContainer({"margin-bottom":"2em", "margin-top":"2em"})
        .wait(getHtml("instructions").test.complete())
)

            
//practice
Template("refl_practice.csv", row => //takes material from the csv file
    newTrial("practice"
    , 
        
        newTimer("break", 100)
            .start()
            .wait()
        ,
        
        newController("DashedSentence", {s: row.sentence}) //sentence. Mode of presentation + the name of the relevant column in the csv file
            .css("white-space", "nowrap")
            .center()
            .print()
            .wait()
            .remove()
            .log()
        ,
       ( row.QuestYN =="Y" ? [
        newController("Question", {q: row.question, as: ["לא","כן"]}) //Forced choice. Answers are defined after "as", taken from csv. row.question is empty in my csv since we only want to present the answers. Can be used for comprehension questions
            .center()
            .print()
            .log()
        ,
        newTimer("timeout_practice", 5000) // timeout for forced choice in ms
            .start()
            .log()
        ,
        newKey("answer_practice", "FJ") //F key for left choice, J key for right choice
            .callback( getTimer("timeout_practice").stop() ) //stops timer if key is clicked
            .log()
            .cssContainer({"line-height": "150%"})
        ,
        
        getTimer("timeout_practice")
            .wait()
        ,
        
        getController("Question")
            .remove()
        ,
        
        getKey("answer_practice")
         .test.pressed() //if participant pressed key before timeout, nothing happens
         .failure(newText("slow_practice","לאט מדי") //if they did not, they get this message
            .settings.center()
            .cssContainer({"font-size": "32px", "color": "red", "line-height": "150%"}) 
            .print()
            .log()
            ,
            newTimer("afterSentence", 1000) // how long the message is presented for
                .start()
                .wait()
         )
         ] : [
        (newTimer("afterSentence3", 1000)
         .start()
         .wait()
         )
        ])       
)
    .log("item", row.item)
    .log("sentence", row.sentence)
    .log("QuestYN", row.QuestYN)
    .log("question", row.question)
    .log("condition", row.condition)
    .log("correctans", row.correctans)
)


//practice-end
newTrial("practice-end"
    ,
    newText("practice-end", "!זהו סוף האימון. המשפטים הבאים הם כבר הניסוי עצמו. בהצלחה")    
        .center()
        .print()
        .cssContainer({"dir":"rtl", "margin-bottom":"2em"})

    ,
    newButton("continue", "המשך")
        .center()
        .print()
        .wait()
)

// Experimental trial
Template("items_shay.csv", row =>
    newTrial("experimental-trial"
    ,
newTimer("break", 1000)
            .start()
            .wait()
        ,
        newText("Sentence", row.sentence)   
            .css("white-space", "nowrap")
            .center()
            .print()
            .log()
        ,
        newTimer("timeoutsentence", 1500)
            .start()
            .wait()
        ,
        getText("Sentence")
            .remove()
        ,
        newController("Question", {q: row.question, as: [row.answer1F, row.answer2J]})
             .center()
             .print()
             .log()
        ,
            newTimer("afterSentence3", 1000)
             .start()
             .wait()
        ,
            newTimer("timeout_item", 10000)
             .start()
             .log()
        ,
            newKey("answer_item", "FJ")
             .callback( getTimer("timeout_item").stop() )
             .log("all")
        ,
            getTimer("timeout_item")
             .wait()
        ,
            getController("Question")
             .remove()
        ,
        
            getKey("answer_item")
             .test.pressed()
             .failure(newText("לאט מדי")
             .settings.center()
             .cssContainer({"font-size": "32px", "color": "red"}) 
             .print()
             .log()
            ,
            newTimer("afterSentence4", 1000)
             .start()
             .wait()
            )
)
    .log("group", row.group)
    .log("item", row.item)
    .log("sentence", row.sentence)
    .log("question", row.question)
    .log("condition", row.condition)
    .log("correctans", row.correctans)
)   
//fillers
Template("fillers_shay.csv", row =>
    newTrial("fillers"
   ,
newTimer("break", 1000)
            .start()
            .wait()
        ,
        newText("Sentence", row.sentence)   
            .css("white-space", "nowrap")
            .center()
            .print()
            .log()
        ,
        newTimer("timeoutsentence", 1500)
            .start()
            .wait()
        ,
        getText("Sentence")
            .remove()
        ,
        newController("Question", {q: row.question, as: [row.answer1F, row.answer2J]})
             .center()
             .print()
             .log()
        ,
            newTimer("afterSentence3", 1000)
             .start()
             .wait()
        ,
            newTimer("timeout_item", 10000)
             .start()
             .log()
        ,
            newKey("answer_item", "FJ")
             .callback( getTimer("timeout_item").stop() )
             .log("all")
        ,
            getTimer("timeout_item")
             .wait()
        ,
            getController("Question")
             .remove()
        ,
        
            getKey("answer_item")
             .test.pressed()
             .failure(newText("לאט מדי")
             .settings.center()
             .cssContainer({"font-size": "32px", "color": "red"}) 
             .print()
             .log()
            ,
            newTimer("afterSentence4", 1000)
             .start()
             .wait()
            )
)
    .log("item", row.item)
    .log("sentence", row.sentence)
    .log("question", row.question)
    .log("condition", row.condition)
)
// Send results manually
SendResults("send")

//done
newTrial("done",
    newHtml("done", "done.html")
        .cssContainer({"width":"720px"})
        .center()
        .log()
        .print()
    ,
    newButton("continue", "המשך")
        .center()
        .print()
        .wait()
)

//debriefing
newTrial("debriefing",
    newHtml("debriefing_form", "debriefing.html")
        .cssContainer({"width":"720px"})
        .checkboxWarning("יש למלא את הפרטים על מנת שנוכל להעביר את התשלום")
        .center()
        .log()
        .print()
    ,
    newButton("continue", "לחצו להמשך")
        .center()
        .print()
        .wait(getHtml("debriefing_form").test.complete()
                  .failure(getHtml("debriefing_form").warn())
        )
)

// Completion screen
newTrial("completion_screen",
    newText("thanks", "תודה על השתתפותך ")
        .center()
        .print()
    ,
    newButton("end experiement", "סיום")
        .center()
        .print()
        .wait()
)