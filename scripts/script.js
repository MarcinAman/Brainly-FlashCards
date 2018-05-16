
class Answer {
    constructor(props){
        this.state = {
            answer: props.answer,
            correct: props.correct
        }
    }

    render(){
        return '<div class="answerContent">'+this.state.answer+'</div>'
    }
}

class Question{
    constructor(props,isAnswered){
        this.state = {
            question: props.question,
            answers: this.parseAnswers(props.answers),
            isAnswered: isAnswered,
            currentAnswer:false
        }
    }

    parseAnswers(answers){
        return answers.map(
            (element) => new Answer(element)
        )
    }

    handleAnswer(answerContent){
        this.state.answers.forEach(
            (e) => {
                if(e.answer === answerContent){
                    this.state.currentAnswer = e
                }
            }
        )
    }

    isCorrect(){
        return this.state.currentAnswer !== undefined && this.state.currentAnswer.correct
    }

    render(){
        return '<div class="sg-text-bit">'+this.state.question+'</div>' +
            '<ul class="sg-list">'+this.state.answers.reduce((prev,current) => prev.concat(
                '<li class="sg-list__element">'+
                    '<div class="sg-list__icon">'+
                        '<svg class="sg-icon sg-icon--dark sg-icon--x18">'+
                            '<use xlink:href="#icon-arrow_right"></use>'+
                        '</svg>'+
                    '</div>'+
                '<div class="sg-text sg-text--headline">'+current.render()+'</div>'+
                '</li>'
            ),'')+'</ul>'
    }
}

class GameWindow{
    constructor(url){
        this.state = {
        }

        this.fetchRequest(url).then((e) => this.parseJSON(e)).then(
            (e) => (this.state = {
                questions: e,
                currentQuestion: 0,
                recentlyRendered: 0
            })
        )
            .then(
                () => this.render()
            )
    }

    parseJSON(response){
        return response.map(
            (e) => new Question(e,false)
        )
    }

    fetchRequest(url){
        return fetch(url).then(
            (e) => e.json()
        ).catch(
            (err) => ({
                error: true,
                description: err.toString()
            })
        )
    }

    handleAnswer(answerContent){
        this.state.questions[this.state.currentQuestion-1].handleAnswer(answerContent)
        this.render()
    }

    getNextQuestion(){
        let iterator = 0
        for(let a in this.state.questions){
            if(!this.state.questions[a].isCorrect()){
                if(iterator === this.state.currentQuestion){
                    return a
                }
                else{
                    iterator += 1
                }
            }
        }

        return undefined
    }

    render(){
        /*make modal not visible since we have data */

        document.getElementsByClassName('main-frame-modal-loader')[0].style.display = 'none';
        const element = document.getElementsByClassName('main-frame-box')[0]
        element.style.display = 'block'

        const toRender = this.getNextQuestion()

        if(toRender !== undefined){
            /* and render another element */
            this.state.recentlyRendered = toRender

            element.innerHTML = '<div>'+this.state.questions[toRender].render()+'</div>'

            this.state.currentQuestion += 1

            /* Adding a on click event to answers */

            const answers = document.getElementsByClassName('answerContent')

            /*because for now we cant iterate over a html collection and our code should be compatible with all browsers */

            for(let a = 0;a<answers.length;a++){
                answers[a].addEventListener('click',()=>{
                    applicationState.window.handleAnswer(answers[a].innerHTML)
                })
            }
        }
        else{
            element.innerHTML = '<div>'+'End'+'</div>'+'<div>'+
                '<button onclick="applicationState.window.state.content.render()">Try again</button>'+'</div>'
            this.state.currentQuestion = 0
        }
    }
}

class PreviewWindow{
    render(){
        /* make visible */
        const element = document.getElementsByClassName('main-frame-box')[0]
        element.style.display = 'block'

        /*hide modal*/
        document.getElementsByClassName('main-frame-modal-loader')[0].style.display = 'none'

        /*Render button*/
        element.innerHTML = '<div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">'+
            '<button class="sg-button-primary sg-button-primary--alt" onclick="applicationState.window.renderQuestions()" >Play</button></div>'
    }
}

class App{
    constructor(){
        this.state = {
            url:'https://gist.githubusercontent.com/vergilius/6d869a7448e405cb52d782120b77b82c/raw/e75dc7c19b918a9f0f5684595899dba2e5ad4f43/history-flashcards.json',
            content: new PreviewWindow()
        }
        this.state.content.render()
    }

    handleAnswer(answerContent){
        this.state.content.handleAnswer(answerContent)
    }

    renderQuestions(){
        this.state.content = new GameWindow(this.state.url)
    }

    render(){
        this.state.content.render()
    }
}


const applicationState = {
    window: new App()
}