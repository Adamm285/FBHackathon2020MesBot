
'use strict';
// import ProgressBar from 'react-bootstrap/ProgressBar';
// import React from "react";
const e = React.createElement;

class LikeButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { liked: false };
  }

  render() {

    if (this.state.liked) {
      return 'You liked this.';
    }

    return e(
      'button',
      { onClick: () => this.setState({ liked: true }) },
      'Like'
    );
  }
  
}

const domContainer = document.querySelector('#the_react_container');
ReactDOM.render(e(LikeButton), domContainer);