import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Image.css';

class Image extends Component {
  constructor(props) {
    super(props);

    this.imageRef = React.createRef();

    this.clickOnKeyPress = this.clickOnKeyPress.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    this.imageRef.current.addEventListener('keydown', this.clickOnKeyPress);
  }

  componentWillUnmount() {
    this.imageRef.current.removeEventListener('keydown', this.clickOnKeyPress);
  }

  clickOnKeyPress(e) {
    if (e.keyCode === 13) {
      this.props.onClick(this.props.image);
    }
  }

  onClick() {
    this.props.onClick(this.props.image);
  }

  render() {
    return (
      <img
        alt={
          `'${this.props.image.movieName}' (${this.props.image.languageCode}) ` +
            `[${this.props.image.imageType}] thumbnail`
        }
        src={this.props.image.thumbnailUrl}
        className='Image'
        onClick={this.onClick}
        ref={this.imageRef}
        tabIndex='0'
      />
    );
  }
}

Image.propTypes = {
  image: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Image;
