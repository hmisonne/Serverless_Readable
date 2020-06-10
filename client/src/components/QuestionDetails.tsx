import * as React from 'react'
import { History } from 'history'
import {
  Header,
  Form,
  Progress,
} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getQuestion, submitVote } from '../api/questions-api'
import { Question } from '../types/Question'

interface QuestionsProps {
  auth: Auth
  history: History
  match: {
    params: {
      questionId: string
      userId: string
    }
  }
}

interface QuestionsState {
  value: string
  question?: Question
}


export class QuestionDetails extends React.PureComponent<QuestionsProps, QuestionsState> {
  state: QuestionsState = {
    value: 'optionOneVote',
  }
  
  async componentDidMount() {
    const {questionId, userId} = this.props.match.params
    try {
      const question = await getQuestion(this.props.auth.getIdToken(), userId, questionId)
      this.setState({
        question
      })
    } catch (e) {
      alert(`Failed to fetch question: ${e.message}`)
    }
  }

  handleChange = (e: any, { value }:any) => this.setState({ value })
  
  onSubmit = async (e: any) =>  {
    const {questionId, userId} = this.props.match.params
    const vote = {
      responderId: userId,
      optionSelected: this.state.value,
    }
    try {
      await submitVote(this.props.auth.getIdToken(),userId, questionId, vote)
    } catch (e) {
      alert(`Failed to submit vote: ${e.message}`)
    }
  }
    
  render() {

    return (
      <div>
        <Header as="h1">Would You Rather</Header>

        {this.renderReplyToPoll()}
        {this.renderViewPollDetails()}
      </div>
    )
  }

  renderReplyToPoll() {
    const { value } = this.state
    let optionOneText, optionTwoText
    this.state.question && ({optionOneText, optionTwoText } = this.state.question)
    return (
      <div>
        <Form>
          <Form.Group widths='equal'>
  
            <Form.Radio
              label={optionOneText}
              value='optionOneVote'
              checked={value === 'optionOneVote'}
              onChange={this.handleChange}
              />
              <Form.Radio
              label={optionTwoText}
              value='optionTwoVote'
              checked={value === 'optionTwoVote'}
              onChange={this.handleChange}
              />
              <Form.Button onClick={this.onSubmit}>Vote</Form.Button>
          </Form.Group>
        </Form>
      </div>
    )
  }

  renderViewPollDetails() {
    let optionOneResult = 0
    let optionTwoResult = 0
    let optionOneText = ''
    let optionTwoText = ''
    this.state.question && this.state.question.optionOneVote && (
      optionOneResult = this.state.question.optionOneVote.length
      )
    this.state.question && this.state.question.optionTwoVote && (
      optionTwoResult = this.state.question.optionTwoVote.length
      )
    this.state.question && this.state.question.optionOneText && (
      optionOneText = this.state.question.optionOneText
      )
    this.state.question && this.state.question.optionTwoText && (
      optionTwoText = this.state.question.optionTwoText
      )
    

    const totalVotes = optionOneResult + optionTwoResult
    return(
      <div>
        <Progress value={optionOneResult} total={totalVotes} progress='percent' label={optionOneText}/>
        <Progress value={optionTwoResult} total={totalVotes} progress='percent' label={optionTwoText}/>
			</div>

    )
  }
}

