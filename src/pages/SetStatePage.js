import {Component} from "react";

export default class SetStatePage extends Component {
  constructor(props) {
    super(props);
    this.state = {count: 0};
  }

  componentDidMount() {
    document
      .getElementById("btn")
      .addEventListener("click", this.change, false);
  }

  change = () => {
    // setTimeout(() => {
    this.setState({count: this.state.count + 1});
    console.log("count", this.state.count); //sy-log
    // }, 0);
  };

  render() {
    return (
      <div>
        <h3>SetStatePage</h3>
        <button onClick={this.change}>{this.state.count}</button>
        <button id="btn">原生事件{this.state.count}</button>
      </div>
    );
  }
}
