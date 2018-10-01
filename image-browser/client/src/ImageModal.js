import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './ImageModal.css';

class ImageModal extends Component {
  constructor(props) {
    super(props);

    this.containerRef = React.createRef();

    this.closeModalOnClick = this.closeModalOnClick.bind(this);
    this.closeModalOnKeyPress = this.closeModalOnKeyPress.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.closeModalOnKeyPress);
    document.addEventListener('mousedown', this.closeModalOnClick);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.closeModalOnKeyPress);
    document.removeEventListener('mousedown', this.closeModalOnClick);
  }

  closeModalOnClick(e) {
    if (!this.containerRef.current.contains(e.target)) {
      this.props.closeModal();
    }
  }

  closeModalOnKeyPress(e) {
    if (e.keyCode === 27) {
      this.props.closeModal();
    }
  }

  render() {
    return (
      <div className='ImageModal' ref={this.containerRef}>
        <div className='ImageModal-image-container'>
          <img
            alt={
              `'${this.props.image.movieName}' (${this.props.image.languageCode}) ` +
                `[${this.props.image.imageType}] full-size`
            }
            src={this.props.image.fullSizeImageUrl}
          />
        </div>

        <div className='ImageModal-text'>
          <button className='ImageModal-close-link' onClick={this.props.closeModal}>Close</button>

          <dl>
            <dt className='ImageModal-details-list-term'>movieName</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.movieName}</dd>

            <dt className='ImageModal-details-list-term'>movieId</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.movieId}</dd>

            <dt className='ImageModal-details-list-term'>languageCode</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.languageCode}</dd>

            <dt className='ImageModal-details-list-term'>imageType</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.imageType}</dd>

            <dt className='ImageModal-details-list-term'>fullSizeImageUrl</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.fullSizeImageUrl}</dd>

            <dt className='ImageModal-details-list-term'>thumbnailUrl</dt>
            <dd className='ImageModal-details-list-def'>{this.props.image.thumbnailUrl}</dd>
          </dl>
        </div>
      </div>
    );
  }
}

ImageModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  image: PropTypes.object.isRequired,
};

export default ImageModal;
