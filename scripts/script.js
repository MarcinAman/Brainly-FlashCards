class Queue{
    constructor(){
        this.state = {
            content: [],
            head: undefined
        }
    }

    push(value){
        this.state.content.push(value)
    }

    pop(){
        if(this.state.content.length < 1){
            return undefined
        }
        this.state.head = this.state.content.shift()
        return this.state.head
    }
}

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
    constructor(props){
        this.state = {
            question: props.question,
            answers: this.parseAnswers(props.answers),
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
                if(e.state.answer === answerContent){
                    this.state.currentAnswer = e
                }
            }
        )
    }

    isCorrect(){
        return this.state.currentAnswer && this.state.currentAnswer.state.correct
    }


    render(){
        return '<div class="sg-header-primary sg-header-primary--small">'+this.state.question+'</div>'+
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
            questions: new Queue(),
            currentQuestion: 0,
            recentlyRendered: 0,
        }

        this.fetchRequest(url).then((e) => this.parseJSON(e))
            .then(
                () => this.render()
            )
    }

    parseJSON(response){
        return response.map(
            (e) => this.state.questions.push(new Question(e))
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

    renderAnswer(type,color){
        const element = document.getElementById('main-frame')

        let html = ''
        if(color === 'red'){
            html = '<div class="sg-text-bit sg-text-bit--small sg-text-bit--warning center">'+type+'</div>'
        }
        else{
            html = '<div class="sg-text-bit sg-text-bit--small center">'+type+'</div>'
        }

        element.innerHTML = html

        setTimeout(()=>{
            this.render()
        },750) //0.5s should be fine
    }

    handleAnswer(answerContent){
        this.state.recentlyRendered.handleAnswer(answerContent)
        if(!this.state.recentlyRendered.isCorrect()) {
            this.state.questions.push(this.state.recentlyRendered)
            this.renderAnswer('Wrong ;(','red')
        }
        else{
            this.renderAnswer('Correct!','green')
        }
    }

    getNextQuestion(){
        this.state.recentlyRendered = this.state.questions.pop()
        return this.state.recentlyRendered
    }

    render(){
        /*make modal not visible since we have data */

        document.getElementById('main-frame-modal-loader').style.display = 'none';

        const element = document.getElementById('main-frame')
        element.style.display = 'block'

        const toRender = this.getNextQuestion()

        if(toRender !== undefined){
            /* and render another element */

            element.innerHTML = '<div>'+toRender.render()+'</div>'

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
            element.innerHTML = '<h1 class="sg-text-bit sg-text-bit--alt">You are the best!</h1>'
                +'<h2 class="sg-header-secondary">You have answered all questions correctly</h2>'
                +'<div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">'+
                '<br><br>'+
                '<button class="sg-button-primary sg-button-primary--alt"'+
                'onclick="applicationState.window.renderQuestions()">Try Again</button></div>'

        }
    }
}

class PreviewWindow{
    constructor(){
        this.state = {
            bulletContent: ['Click on answer that You think is correct',
                            'If the answer was wrong the card will be moved to the end',
                            'After answering all questions correctly the game will finish',
                            'Have fun!']
        }
    }

    getBulletContentHTML(){
        return this.state.bulletContent.reduce(
            (prev,current) => {
                return prev.concat(
                    '<li class="sg-list__element"><div class="sg-list__icon"><svg class="sg-icon sg-icon--gray-secondary sg-icon--x18">' +
                        '<use xlink:href="#icon-plus"></use></svg></div>' +
                        '<div class="sg-text sg-text--emphasised">'+current+'</div>' +
                        '</li>')
            },''
        )
    }

    render(){
        const element = document.getElementById('main-frame')

        /*Render first window content */
        element.innerHTML = '<h1 class="sg-text-bit sg-text-bit--alt">Brainly Flash cards</h1><br>'+
            '<h2 class="sg-header-secondary">Howto:</h2>'
            + '<ul class="sg-list">'
            + this.getBulletContentHTML() +
                '</ul><br>'
            +'<div class="sg-content-box__content sg-content-box__content--spaced-bottom-large">'+
            '<button class="sg-button-primary sg-button-primary--alt" onclick="applicationState.window.renderQuestions()" >Play</button></div>'
    }
}

class App{
    constructor(){
        this.state = {
            url: 'https://gist.githubusercontent.com/vergilius/6d869a7448e405cb52d782120b77b82c/raw/e75dc7c19b918a9f0f5684595899dba2e5ad4f43/history-flashcards.json',
            content: new PreviewWindow()
        }
        this.state.content.render()
    }

    handleAnswer(answerContent){
        this.state.content.handleAnswer(answerContent)
    }

    renderModal(){
        document.getElementById('main-frame').style.display = 'none'
        document.getElementById('main-frame-modal-loader').style.display = 'block'
    }

    renderQuestions(){
        this.renderModal()
        this.state.content = new GameWindow(this.state.url)
    }

    render(){
        this.state.content.render()
    }
}

const applicationState = {
    window: new App()
}