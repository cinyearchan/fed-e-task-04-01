import React, { render, Component } from "./react"

const root = document.getElementById("root")

const jsx = (
  <div>
    <p>Hello React</p>
    <p>Hi Fiber</p>
  </div>
)

// render(jsx, root)

class Greeting extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    return <div>greeting</div>
  }
}

// render(<Greeting/>, root)

function FnComponent() {
  return <div>FnComponent</div>
}

render(<FnComponent/>, root)
