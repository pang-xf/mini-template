import { Component } from 'react'
import { Provider } from 'mobx-react'
import counterStore from './store/counter'
import './app.scss'

class App extends Component {
  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 就是要渲染的页面
  render () {
    return (
      <Provider counterStore={counterStore}>
        {this.props.children}
      </Provider>
    )
  }
}

export default App
