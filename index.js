import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// initialize global variables
let questions = [];
let counter = 0;
let currQuestion = null;
let score = 0;

// home
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// get questions from opentdb API and store them
app.post("/getQuestions", async(req, res) => {
  try {
    const result =  await axios.get("https://opentdb.com/api.php", {params: {
      "amount": req.body.questions,
      "category": req.body.category,
      "difficulty": req.body.difficulty,
      "type": "multiple",
    }
  });
    // reset global variables (useful for subsequent quizzes)
    questions = result.data.results;
    counter = 0;
    score = 0;
    // console.log(questions);
    res.redirect("/quiz");
  } catch (error) {
    res.status(500);
  }
})

// main function, called by both get and post /quiz
function nextQuestion(req, res) {
  if (counter < questions.length) {
    currQuestion = questions[counter];
    // console.log(currQuestion);
    counter++;
    res.render("quiz.ejs", {
      question: currQuestion,
      counter: counter,
      totalQuestions: questions.length,
    });
  } else {
    res.redirect("/results");
  }
};

// first question
app.get("/quiz", nextQuestion);

// next questions: keep track of score
app.post("/quiz", (req, res) => {
  // console.log(req.body);
  if (req.body["selected-answer"] == currQuestion.correct_answer) {
    score++;
  }
  nextQuestion(req, res);
})

// quiz end: show score and redirect to home page to try a new quiz
app.get("/results", (req, res) => {
  res.render("end-results.ejs", {
    score: score,
  });
})

// app start
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});  
