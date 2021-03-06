import * as React from 'react'
import { History } from 'history'
import {
  Divider,
  Grid,
  Header,
  Loader,
  Button,
  Icon,
  Image
} from 'semantic-ui-react'
import { getQuestions } from '../api/questions-api'
import { getAnswersByUser } from '../api/users-api'
import Auth from '../auth/Auth'
import { Question } from '../types/Question'
import { deleteQuestion} from '../api/questions-api'

interface QuestionsProps {
  auth: Auth
  history: History
}

interface QuestionsState {
  showUnanswered: boolean
  questions: Question[]
  answers: any
  userId?: string
  loadingQuestions: boolean
}

export class Questions extends React.PureComponent<QuestionsProps, QuestionsState> {
  state: QuestionsState = {
    showUnanswered: true,
    questions: [],
    answers: {},
    loadingQuestions: true
  }

  async componentDidMount() {
    try {
      const questions = await getQuestions(this.props.auth.getIdToken())
      const result = await getAnswersByUser(this.props.auth.getIdToken())
      let answers = {}
      let userId = ''
      if (result[0]){
        answers = result[0].answers
        userId = result[0].userId
      }
      if (questions && result){
        this.setState({
          questions,
          answers,
          userId,
          loadingQuestions: false
        })
      }
    } catch (e) {
      alert(`Failed to fetch questions: ${e.message}`)
    }
  }

  onQuestionDelete = async(questionId: string) => {
    try{
        await deleteQuestion(this.props.auth.getIdToken(), questionId)
        this.setState({
          questions: this.state.questions.filter(question => question.questionId !== questionId
            )})
    } catch(e) {
        alert('Question Deletion failed')
    }
  
  }

  goToQuestionDetails = (question: Question, currResponse: any) => {
      const {userId, questionId} = question
      this.props.history.push(`/users/${userId}/questions/${questionId}`, {currResponse})
  }

  goToUploadImage = (questionId: string) => {
    this.props.history.push(`/questions/${questionId}/edit`)
  }
  toggleShowAnswers = () => {
    this.setState((prevState) => ({
      showUnanswered: !prevState.showUnanswered
    }))
  }
  render() {
    return (
      <div>
        <Header as="h1">Would You Rather</Header>

        {this.renderQuestions()}
      </div>
    )
  }


  renderQuestions() {
    if (this.state.loadingQuestions) {
      return this.renderLoading()
    }

    return this.renderQuestionsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Questions
        </Loader>
      </Grid.Row>
    )
  }

  renderQuestionsList() {
    const {questions, answers, showUnanswered, userId} = this.state
    return (
      <Grid padded>
      <Button.Group>
        <Button 
          disabled ={showUnanswered} 
          onClick={() => this.toggleShowAnswers()}>
          UnAnswered
        </Button>
        <Button 
          disabled ={!showUnanswered}
          onClick={() => this.toggleShowAnswers()}>
            Answered
        </Button>
      </Button.Group>
      
        {questions.map((question) => {
          if ((answers[question.questionId] && !showUnanswered) || (!answers[question.questionId] && showUnanswered)){
             return (
            <Grid.Row key={question.questionId}>
              <Grid.Column width={10} verticalAlign="middle">
                {question.optionOneText} or {question.optionTwoText} ?
              </Grid.Column>
              
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.goToQuestionDetails(question, answers[question.questionId])}
                >
                  <Icon name="check square" />
                </Button>
                
                </Grid.Column>
                
                  <Grid.Column width={1} floated="right"> 
                  {(question.userId === userId) &&
                    <Button
                      icon
                      color="blue"
                      onClick={() => this.goToUploadImage(question.questionId)}
                    >
                      <Icon name="pencil" />
                    </Button>
                     }
                  </Grid.Column>
                  <Grid.Column width={1} floated="right">
                    {(question.userId === userId) &&
                      <Button
                        icon
                        color="red"
                        onClick={() => this.onQuestionDelete(question.questionId)}
                      >
                        <Icon name="delete" />
                      </Button>
                    }
                  </Grid.Column>
              <Grid.Column width={16}>
              {question.attachmentUrl && (
                  <Image src= {question.attachmentUrl} size="small" wrapped/>
                )}
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
          } else {
            return (
              null
          )
        }
        })}
      </Grid>
    )
  }
}

